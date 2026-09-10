/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Student,
  SchoolClass,
  StaffMember,
  TimetableSlot,
  SystemSettings,
  AppNotification,
  AttendanceStatus,
  AttendanceEntry,
  StaffRole,
  UserAccount,
  PeriodTimingConfig,
  AppTheme,
  MedicalExcuse,
} from '../types';
import { soundFx } from '../utils/audio';

export interface SessionMeta {
  submittedAt: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  submittedBy?: string;
  submittedTeacherName?: string;
  periodNumber?: number;
  classId?: string;
}

interface AttendanceContextType {
  // Navigation & View
  activeTab: 'take_attendance' | 'todays_attendance' | 'dashboard' | 'timetable' | 'history' | 'students' | 'settings';
  setActiveTab: (tab: 'take_attendance' | 'todays_attendance' | 'dashboard' | 'timetable' | 'history' | 'students' | 'settings') => void;

  // Authentication & Users
  currentUser: UserAccount | null;
  users: UserAccount[];
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerUser: (userData: Omit<UserAccount, 'id'>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchUser: (userId: string) => void;
  addUserAccount: (user: Omit<UserAccount, 'id'>) => Promise<void>;
  updateUserAccount: (id: string, updates: Partial<UserAccount>) => Promise<void>;
  deleteUserAccount: (id: string) => Promise<void>;

  // Period timings
  periodTimings: PeriodTimingConfig[];
  updatePeriodTiming: (periodNumber: number, updates: Partial<PeriodTimingConfig>) => Promise<void>;

  // Class & Session selection
  classes: SchoolClass[];
  addClass: (cls: Omit<SchoolClass, 'id'>) => Promise<SchoolClass>;
  updateClass: (id: string, updates: Partial<SchoolClass>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, updates: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  // Medical Excuses
  medicalExcuses: MedicalExcuse[];
  uploadMedicalExcuse: (studentId: string, date: string, imageUrl: string, fileName?: string) => Promise<void>;
  getStudentExcuse: (studentId: string, date?: string) => MedicalExcuse | undefined;
  deleteMedicalExcuse: (id: string) => Promise<void>;

  // Active Class & Students
  activeClass: SchoolClass;
  activeStudents: Student[];
  currentSessionKey: string;
  currentRecords: Record<string, AttendanceEntry>;
  isCurrentSessionSubmitted: boolean;
  currentSessionMeta?: SessionMeta;
  submittedSessions: Record<string, SessionMeta>;
  isSessionSubmitted: (classId: string, periodNumber: number, date?: string) => boolean;
  getSessionMeta: (classId: string, periodNumber: number, date?: string) => SessionMeta | undefined;

  // Attendance Actions & Authorization
  attendanceChangeCount: number;
  canUserEditAttendance: (classId: string, periodNumber: number) => { allowed: boolean; reason?: string };
  setStudentStatus: (studentId: string, status: AttendanceStatus, note?: string) => void;
  markAllPresent: () => void;
  resetAttendanceSession: () => Promise<void>;
  submitAttendanceSession: () => Promise<{ present: number; absent: number; late: number; excused: number }>;
  reopenAttendanceSession: () => Promise<void>;

  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => Promise<void>;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => Promise<void>;
  deleteTimetableSlot: (id: string) => Promise<void>;
  currentTeacherSlot: TimetableSlot | null;
  allAssignedTeacherSlots: TimetableSlot[];

  // Admin & Staff
  staff: StaffMember[];
  updateStaffRole: (staffId: string, role: StaffRole) => Promise<void>;
  settings: SystemSettings;
  updateSetting: (key: keyof SystemSettings, val: any) => Promise<void>;
  toggleEmergencyLockdown: (reason?: string) => Promise<void>;

  // Alerts & Notifications
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: 'reminder' | 'warning' | 'info', classId?: string) => Promise<void>;
  triggerTestAlert: (classId?: string, customMessage?: string) => void;
  dismissNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  requestNotificationPermission: () => Promise<boolean>;

  // System Preferences
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  fastLoadMode: boolean;
  setFastLoadMode: (mode: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;

  // Overall Stats
  overallStats: {
    totalStudents: number;
    totalPresent: number;
    totalAbsent: number;
    totalLate: number;
    totalExcused: number;
    attendanceRate: number;
    pendingClassesCount: number;
  };

  // Local storage last synced
  lastSavedAt: string;
  quickAddStudentNote: (studentId: string, note: string) => void;
}

const AttendanceContext = createContext<AttendanceContextType | null>(null);

const STORAGE_KEY_PREFIX = 'school_att_';
const API_BASE_URL = '';

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'فشلت المزامنة مع خادم البيانات.');
  }
  return data;
}

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'take_attendance' | 'todays_attendance' | 'dashboard' | 'timetable' | 'history' | 'students' | 'settings'>('take_attendance');

  // Core Backend States
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {}
    }
    return null;
  });

  const [periodTimings, setPeriodTimings] = useState<PeriodTimingConfig[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [medicalExcuses, setMedicalExcuses] = useState<MedicalExcuse[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    enableSmsAlerts: true,
    pauseAlertsOnHolidays: true,
    defaultAllPresent: true,
    allowOfflineMode: true,
    lockEditingAfterPeriod: false,
    emergencyLockdown: false,
    schoolName: 'مدرسة الملك حسين بن طلال الثانوية للبنين',
    editingDeadline: '14:00',
    editingDeadlineEnabled: false,
    enablePushNotifications: true,
    requireExcuseImage: false,
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Selection
  const [selectedClassId, setSelectedClassId] = useState<string>('class-9th');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [currentDate, setCurrentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Attendance Records mapped by: `${classId}_${date}_p${period}` -> { [studentId]: AttendanceEntry }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, AttendanceEntry>>>( {});
  const [submittedSessions, setSubmittedSessions] = useState<Record<string, SessionMeta>>({});
  const [attendanceChangeCount, setAttendanceChangeCount] = useState<number>(0);

  // Preferences
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  const [fastLoadMode, setFastLoadModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'fast_load');
    return saved ? JSON.parse(saved) : false;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'sound');
    return saved ? JSON.parse(saved) : true;
  });

  const [lastSavedAt, setLastSavedAt] = useState<string>('مبتدئ');

  // Load Initial Data from Backend
  const loadBackendData = async () => {
    try {
      const [uRes, cRes, sRes, stRes, ttRes, ptRes, setRes, notifRes, excRes] = await Promise.all([
        apiFetch('/api/users').catch(() => []),
        apiFetch('/api/classes').catch(() => []),
        apiFetch('/api/students').catch(() => []),
        apiFetch('/api/staff').catch(() => []),
        apiFetch('/api/timetable').catch(() => []),
        apiFetch('/api/periods').catch(() => []),
        apiFetch('/api/settings').catch(() => ({})),
        apiFetch('/api/notifications').catch(() => []),
        apiFetch('/api/excuses').catch(() => []),
      ]);

      if (Array.isArray(uRes) && uRes.length > 0) setUsers(uRes);
      if (Array.isArray(cRes) && cRes.length > 0) {
        setClasses(cRes);
        if (!cRes.some(c => c.id === selectedClassId)) {
          setSelectedClassId(cRes[0].id);
        }
      }
      if (Array.isArray(sRes)) setStudents(sRes);
      if (Array.isArray(stRes)) setStaff(stRes);
      if (Array.isArray(ttRes)) setTimetable(ttRes);
      if (Array.isArray(ptRes)) setPeriodTimings(ptRes);
      if (setRes && Object.keys(setRes).length > 0) setSettings(prev => ({ ...prev, ...setRes }));
      if (Array.isArray(notifRes)) setNotifications(notifRes);
      if (Array.isArray(excRes)) setMedicalExcuses(excRes);

      // Verify currently logged in user profile if token exists
      const token = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth_token');
      if (token) {
        try {
          const meData = await apiFetch('/api/auth/me');
          if (meData?.user) {
            setCurrentUser(meData.user);
            localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(meData.user));
          }
        } catch {
          // Token invalid or expired
          localStorage.removeItem(STORAGE_KEY_PREFIX + 'auth_token');
          localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
          setCurrentUser(null);
        }
      }

      setLastSavedAt(new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('Failed to load initial data from backend:', err);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Fetch Attendance Session Data whenever selectedClassId, selectedPeriod, or currentDate changes
  const fetchCurrentSession = async (classId: string, period: number, date: string) => {
    try {
      const data = await apiFetch(`/api/attendance?classId=${classId}&date=${date}&period=${period}`);
      const key = `${classId}_${date}_p${period}`;
      if (data?.session) {
        if (data.session.isSubmitted) {
          const present = Object.values(data.records as Record<string, any>).filter((r: any) => r.status === 'present').length;
          const absent = Object.values(data.records as Record<string, any>).filter((r: any) => r.status === 'absent').length;
          const late = Object.values(data.records as Record<string, any>).filter((r: any) => r.status === 'late').length;
          const excused = Object.values(data.records as Record<string, any>).filter((r: any) => r.status === 'excused').length;

          setSubmittedSessions(prev => ({
            ...prev,
            [key]: {
              submittedAt: data.session.submittedAt || '',
              total: Object.keys(data.records).length,
              present,
              absent,
              late,
              excused,
              submittedBy: data.session.submittedBy,
              submittedTeacherName: data.session.submittedTeacherName,
              periodNumber: period,
              classId,
            },
          }));
        } else {
          setSubmittedSessions(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
          });
        }

        if (data.records && Object.keys(data.records).length > 0) {
          setAttendanceMap(prev => ({
            ...prev,
            [key]: data.records,
          }));
        }
      }
    } catch (e) {
      console.error('Error fetching attendance session:', e);
    }
  };

  useEffect(() => {
    if (selectedClassId && selectedPeriod && currentDate) {
      fetchCurrentSession(selectedClassId, selectedPeriod, currentDate);
    }
  }, [selectedClassId, selectedPeriod, currentDate]);

  // Derived current session key
  const currentSessionKey = useMemo(() => {
    return `${selectedClassId}_${currentDate}_p${selectedPeriod}`;
  }, [selectedClassId, currentDate, selectedPeriod]);

  // Active Class object
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0] || {
      id: selectedClassId,
      name: 'الفصل المحدد',
      gradeLevel: 'غير محدد',
      room: 'غير محدد',
      homeroomTeacher: 'غير محدد',
      studentCount: 0,
    };
  }, [classes, selectedClassId]);

  // Active Students in selected class
  const activeStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Ensure all students default to "حاضر" (Present) if session records don't exist yet
  const currentRecords = useMemo(() => {
    const existing = attendanceMap[currentSessionKey];
    if (existing && Object.keys(existing).length > 0) {
      return existing;
    }
    const defaultRecords: Record<string, AttendanceEntry> = {};
    activeStudents.forEach(st => {
      defaultRecords[st.id] = {
        studentId: st.id,
        status: 'present',
        updatedAt: new Date().toISOString(),
      };
    });
    return defaultRecords;
  }, [attendanceMap, currentSessionKey, activeStudents]);

  const isCurrentSessionSubmitted = !!submittedSessions[currentSessionKey];
  const currentSessionMeta = submittedSessions[currentSessionKey];

  // Theme effect
  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Helper methods to query submission state for any period
  const isSessionSubmitted = (classId: string, periodNumber: number, date: string = currentDate): boolean => {
    const key = `${classId}_${date}_p${periodNumber}`;
    return !!submittedSessions[key];
  };

  const getSessionMeta = (classId: string, periodNumber: number, date: string = currentDate): SessionMeta | undefined => {
    const key = `${classId}_${date}_p${periodNumber}`;
    return submittedSessions[key];
  };

  // Medical Excuses methods
  const uploadMedicalExcuse = async (studentId: string, date: string, imageUrl: string, fileName?: string) => {
    try {
      const result = await apiFetch('/api/excuses', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          date,
          imageUrl,
          fileName,
          uploadedBy: currentUser?.name || 'المعلم',
        }),
      });

      const newExcuse: MedicalExcuse = {
        id: result.id,
        studentId,
        date,
        imageUrl,
        fileName,
        uploadedAt: result.uploadedAt,
        uploadedBy: result.uploadedBy,
      };

      setMedicalExcuses(prev => [newExcuse, ...prev.filter(e => !(e.studentId === studentId && e.date === date))]);

      // Automatically update student status to excused if in current session
      setStudentStatus(studentId, 'excused', 'تم إرفاق عذر طبي مصور');

      if (soundEnabled) soundFx.playSuccess();
    } catch (e) {
      console.error('Error uploading excuse:', e);
    }
  };

  const getStudentExcuse = (studentId: string, date: string = currentDate): MedicalExcuse | undefined => {
    return medicalExcuses.find(e => e.studentId === studentId && (e.date === date || !e.date));
  };

  const deleteMedicalExcuse = async (id: string) => {
    try {
      await apiFetch(`/api/excuses/${id}`, { method: 'DELETE' });
      setMedicalExcuses(prev => prev.filter(e => e.id !== id));
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error deleting excuse:', e);
    }
  };

  // Teacher Slot Resolver
  const resolveTeacherSlot = (
    user: UserAccount,
    customTimetable = timetable,
    customSubmitted = submittedSessions,
    customClasses = classes
  ): { classId: string; periodNumber: number } | null => {
    if (user.role !== 'teacher') return null;

    const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
    };
    const jsDay = new Date().getDay();
    const todayName = daysMap[jsDay] || 'الأحد';

    const teacherSlotsToday = customTimetable.filter(
      s =>
        s.day === todayName &&
        (s.teacherId === user.teacherId ||
          s.teacherId === user.id ||
          s.substituteTeacherId === user.id ||
          s.substituteTeacherId === user.teacherId ||
          (s.substituteTeacherName &&
            (s.substituteTeacherName === user.name ||
              user.name.includes(s.substituteTeacherName) ||
              s.substituteTeacherName.includes(user.name))) ||
          (user.assignedClasses && user.assignedClasses.includes(s.classId)))
    );

    if (teacherSlotsToday.length > 0) {
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      for (const slot of teacherSlotsToday) {
        const timing = periodTimings.find(pt => pt.periodNumber === slot.periodNumber);
        if (timing) {
          const [startH, startM] = timing.startTime.split(':').map(Number);
          const [endH, endM] = timing.endTime.split(':').map(Number);
          const startMin = startH * 60 + startM;
          const endMin = endH * 60 + endM;
          if (nowMinutes >= startMin - 10 && nowMinutes <= endMin + 15) {
            return { classId: slot.classId, periodNumber: slot.periodNumber };
          }
        }
      }

      const unsubmittedSlot = teacherSlotsToday.find(
        slot => !customSubmitted[`${slot.classId}_${currentDate}_p${slot.periodNumber}`]
      );
      if (unsubmittedSlot) {
        return { classId: unsubmittedSlot.classId, periodNumber: unsubmittedSlot.periodNumber };
      }

      return { classId: teacherSlotsToday[0].classId, periodNumber: teacherSlotsToday[0].periodNumber };
    }

    if (user.assignedClasses && user.assignedClasses.length > 0) {
      const validClass = customClasses.find(c => user.assignedClasses!.includes(c.id));
      if (validClass) {
        const anySlot = customTimetable.find(
          s => s.classId === validClass.id && (s.teacherId === user.teacherId || s.teacherId === user.id)
        );
        return { classId: validClass.id, periodNumber: anySlot ? anySlot.periodNumber : 1 };
      }
    }

    return null;
  };

  const handleSelectClass = (newClassId: string) => {
    setSelectedClassId(newClassId);
    if (currentUser?.role === 'teacher') {
      const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
        0: 'الأحد',
        1: 'الإثنين',
        2: 'الثلاثاء',
        3: 'الأربعاء',
        4: 'الخميس',
      };
      const jsDay = new Date().getDay();
      const todayName = daysMap[jsDay] || 'الأحد';
      const slotForClass = timetable.find(
        s =>
          s.day === todayName &&
          s.classId === newClassId &&
          (s.teacherId === currentUser.teacherId ||
            s.teacherId === currentUser.id ||
            s.substituteTeacherId === currentUser.id ||
            s.substituteTeacherId === currentUser.teacherId)
      );
      if (slotForClass) {
        setSelectedPeriod(slotForClass.periodNumber);
      }
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'teacher') {
      const slot = resolveTeacherSlot(currentUser);
      if (slot) {
        setSelectedClassId(slot.classId);
        setSelectedPeriod(slot.periodNumber);
      }
    }
  }, [currentUser?.id]);

  // Set student status
  const setStudentStatus = (studentId: string, status: AttendanceStatus, note?: string) => {
    if (settings.emergencyLockdown) {
      if (soundEnabled) soundFx.playAlert();
      return;
    }

    if (soundEnabled) {
      soundFx.playTap(status === 'present' ? 520 : status === 'absent' ? 320 : status === 'late' ? 420 : 480);
    }

    setAttendanceChangeCount(prev => prev + 1);

    setAttendanceMap(prev => {
      const current = prev[currentSessionKey] || currentRecords;
      const updated = {
        ...current,
        [studentId]: {
          studentId,
          status,
          note: note !== undefined ? note : current[studentId]?.note,
          updatedAt: new Date().toISOString(),
        },
      };
      return {
        ...prev,
        [currentSessionKey]: updated,
      };
    });

    // Send single record API call
    apiFetch('/api/attendance/record', {
      method: 'POST',
      body: JSON.stringify({
        classId: selectedClassId,
        date: currentDate,
        period: selectedPeriod,
        studentId,
        status,
        note,
      }),
    }).catch(err => console.error('Error saving attendance record to API:', err));
  };

  const markAllPresent = () => {
    if (settings.emergencyLockdown) return;
    if (soundEnabled) soundFx.playSuccess();

    setAttendanceChangeCount(prev => prev + 1);

    const updated: Record<string, AttendanceEntry> = {};
    activeStudents.forEach(st => {
      updated[st.id] = {
        studentId: st.id,
        status: 'present',
        updatedAt: new Date().toISOString(),
      };
    });

    setAttendanceMap(prev => ({
      ...prev,
      [currentSessionKey]: updated,
    }));

    // Submit batch record
    apiFetch('/api/attendance/submit', {
      method: 'POST',
      body: JSON.stringify({
        classId: selectedClassId,
        date: currentDate,
        period: selectedPeriod,
        submittedBy: currentUser?.id,
        submittedTeacherName: currentUser?.name || 'المعلم',
        records: updated,
      }),
    }).catch(err => console.error('Error batch updating present status:', err));
  };

  const resetAttendanceSession = async () => {
    if (settings.emergencyLockdown) return;
    if (soundEnabled) soundFx.playTap(350);

    setAttendanceChangeCount(prev => prev + 1);

    try {
      await apiFetch('/api/attendance/reset', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          date: currentDate,
          period: selectedPeriod,
        }),
      });

      const updated: Record<string, AttendanceEntry> = {};
      activeStudents.forEach(st => {
        updated[st.id] = {
          studentId: st.id,
          status: 'present',
          updatedAt: new Date().toISOString(),
        };
      });

      setAttendanceMap(prev => ({
        ...prev,
        [currentSessionKey]: updated,
      }));

      setSubmittedSessions(prev => {
        const copy = { ...prev };
        delete copy[currentSessionKey];
        return copy;
      });
    } catch (e) {
      console.error('Error resetting attendance session:', e);
    }
  };

  const reopenAttendanceSession = async () => {
    setAttendanceChangeCount(prev => prev + 1);
    try {
      await apiFetch('/api/attendance/reopen', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          date: currentDate,
          period: selectedPeriod,
        }),
      });

      setSubmittedSessions(prev => {
        const copy = { ...prev };
        delete copy[currentSessionKey];
        return copy;
      });
    } catch (e) {
      console.error('Error reopening attendance session:', e);
    }
  };

  const submitAttendanceSession = async () => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    activeStudents.forEach(st => {
      const rec = currentRecords[st.id];
      const status = rec?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    const meta: SessionMeta = {
      submittedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      total: activeStudents.length,
      present,
      absent,
      late,
      excused,
      submittedBy: currentUser?.id,
      submittedTeacherName: currentUser?.name || 'معلم الحصة',
      periodNumber: selectedPeriod,
      classId: selectedClassId,
    };

    setAttendanceChangeCount(prev => prev + 1);

    setSubmittedSessions(prev => ({
      ...prev,
      [currentSessionKey]: meta,
    }));

    setAttendanceMap(prev => ({
      ...prev,
      [currentSessionKey]: currentRecords,
    }));

    try {
      await apiFetch('/api/attendance/submit', {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClassId,
          date: currentDate,
          period: selectedPeriod,
          submittedBy: currentUser?.id,
          submittedTeacherName: currentUser?.name || 'معلم الحصة',
          records: currentRecords,
        }),
      });
    } catch (e) {
      console.error('Error submitting attendance session:', e);
    }

    if (soundEnabled) soundFx.playSuccess();

    return { present, absent, late, excused };
  };

  // Staff role modification
  const updateStaffRole = async (staffId: string, role: StaffRole) => {
    if (soundEnabled) soundFx.playTap();
    try {
      const updated = await apiFetch(`/api/staff/${staffId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      });
      setStaff(prev => prev.map(m => (m.id === staffId ? updated : m)));
    } catch (e) {
      console.error('Error updating staff role:', e);
    }
  };

  // System settings modification
  const updateSetting = async (key: keyof SystemSettings, val: any) => {
    if (soundEnabled) soundFx.playTap();
    const newSettings = { ...settings, [key]: val };
    setSettings(newSettings);
    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ [key]: val }),
      });
    } catch (e) {
      console.error('Error updating settings:', e);
    }
  };

  const toggleEmergencyLockdown = async (reason?: string) => {
    const nextVal = !settings.emergencyLockdown;
    if (soundEnabled) {
      if (nextVal) soundFx.playAlert();
      else soundFx.playSuccess();
    }

    try {
      const res = await apiFetch('/api/settings/lockdown', {
        method: 'POST',
        body: JSON.stringify({ emergencyLockdown: nextVal, reason }),
      });

      setSettings(prev => ({
        ...prev,
        emergencyLockdown: res.emergencyLockdown,
        lockdownTime: res.lockdownTime,
      }));

      // Reload notifications list
      const notifData = await apiFetch('/api/notifications');
      if (Array.isArray(notifData)) setNotifications(notifData);
    } catch (e) {
      console.error('Error toggling emergency lockdown:', e);
    }
  };

  // Add custom notification
  const addNotification = async (
    title: string,
    message: string,
    type: 'reminder' | 'warning' | 'info' = 'reminder',
    classId?: string
  ) => {
    if (soundEnabled) soundFx.playAlert();
    try {
      const created = await apiFetch('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ title, message, type, classId }),
      });
      setNotifications(prev => [created, ...prev]);
    } catch (e) {
      console.error('Error adding notification:', e);
    }
  };

  const triggerTestAlert = (classId = 'class-9th', customMessage?: string) => {
    if (soundEnabled) soundFx.playAlert();
    const targetClass = classes.find(c => c.id === classId) || classes[0];
    const title = 'تنبيه ذكي: موعد الحصة القادمة';
    const message = customMessage || `تبدأ الحصة القادمة لـ (${targetClass ? targetClass.name : 'الفصل'}) خلال 5 دقائق. يرجى رصد الحضور.`;

    addNotification(title, message, 'reminder', targetClass?.id);
  };

  const dismissNotification = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Error dismissing notification:', e);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiFetch('/api/notifications', { method: 'DELETE' });
      setNotifications([]);
    } catch (e) {
      console.error('Error clearing notifications:', e);
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        return true;
      }
    }
    return false;
  };

  const setFastLoadMode = (mode: boolean) => {
    if (soundEnabled) soundFx.playTap();
    setFastLoadModeState(mode);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'fast_load', JSON.stringify(mode));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'sound', JSON.stringify(enabled));
  };

  const quickAddStudentNote = (studentId: string, note: string) => {
    setAttendanceChangeCount(prev => prev + 1);
    setAttendanceMap(prev => {
      const current = prev[currentSessionKey] || currentRecords;
      const rec = current[studentId] || {
        studentId,
        status: 'present',
        updatedAt: new Date().toISOString(),
      };
      return {
        ...prev,
        [currentSessionKey]: {
          ...current,
          [studentId]: {
            ...rec,
            note,
            updatedAt: new Date().toISOString(),
          },
        },
      };
    });

    apiFetch('/api/attendance/record', {
      method: 'POST',
      body: JSON.stringify({
        classId: selectedClassId,
        date: currentDate,
        period: selectedPeriod,
        studentId,
        status: currentRecords[studentId]?.status || 'present',
        note,
      }),
    }).catch(err => console.error('Error saving quick note:', err));
  };

  // Authentication methods
  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      if (res.success && res.token) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'auth_token', res.token);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(res.user));
        setCurrentUser(res.user);

        if (res.user.role === 'teacher') {
          const slot = resolveTeacherSlot(res.user);
          if (slot) {
            setSelectedClassId(slot.classId);
            setSelectedPeriod(slot.periodNumber);
          }
        }

        if (soundEnabled) soundFx.playSuccess();
        return { success: true };
      }
      return { success: false, message: res.message || 'فشل تسجيل الدخول.' };
    } catch (err: any) {
      if (soundEnabled) soundFx.playAlert();
      return { success: false, message: err.message || 'خطأ في التواصل مع الخادم.' };
    }
  };

  const registerUser = async (userData: Omit<UserAccount, 'id'>) => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (res.success && res.token) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'auth_token', res.token);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        setUsers(prev => [res.user, ...prev]);

        if (res.user.role === 'teacher') {
          const slot = resolveTeacherSlot(res.user);
          if (slot) {
            setSelectedClassId(slot.classId);
            setSelectedPeriod(slot.periodNumber);
          }
        }

        if (soundEnabled) soundFx.playSuccess();
        return { success: true };
      }
      return { success: false, message: res.message || 'فشل إنشاء الحساب.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'خطأ في إنشاء الحساب.' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'auth_token');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
    setCurrentUser(null);
    setSelectedPeriod(1);
    if (classes.length > 0) setSelectedClassId(classes[0].id);
    if (soundEnabled) soundFx.playTap();
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(target));
      if (target.role === 'teacher') {
        const slot = resolveTeacherSlot(target);
        if (slot) {
          setSelectedClassId(slot.classId);
          setSelectedPeriod(slot.periodNumber);
        }
      }
      if (soundEnabled) soundFx.playTap();
    }
  };

  const addUserAccount = async (newUserData: Omit<UserAccount, 'id'>) => {
    try {
      const created = await apiFetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });
      setUsers(prev => [created, ...prev]);
      if (soundEnabled) soundFx.playSuccess();
    } catch (e) {
      console.error('Error adding user account:', e);
    }
  };

  const updateUserAccount = async (id: string, updates: Partial<UserAccount>) => {
    try {
      const updated = await apiFetch(`/api/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      if (currentUser?.id === id) {
        setCurrentUser(updated);
        localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(updated));
      }
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error updating user account:', e);
    }
  };

  const deleteUserAccount = async (id: string) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      setUsers(prev => prev.filter(u => u.id !== id));
      if (currentUser?.id === id) {
        logout();
      }
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error deleting user account:', e);
    }
  };

  const updatePeriodTiming = async (periodNumber: number, updates: Partial<PeriodTimingConfig>) => {
    try {
      const updated = await apiFetch(`/api/periods/${periodNumber}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setPeriodTimings(prev => prev.map(pt => (pt.periodNumber === periodNumber ? updated : pt)));
      if (soundEnabled) soundFx.playSuccess();
    } catch (e) {
      console.error('Error updating period timing:', e);
    }
  };

  const addClass = async (newClsData: Omit<SchoolClass, 'id'>): Promise<SchoolClass> => {
    const created = await apiFetch('/api/classes', {
      method: 'POST',
      body: JSON.stringify(newClsData),
    });
    setClasses(prev => [...prev, created]);
    if (soundEnabled) soundFx.playSuccess();
    return created;
  };

  const updateClass = async (id: string, updates: Partial<SchoolClass>) => {
    try {
      const updated = await apiFetch(`/api/classes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setClasses(prev => prev.map(c => (c.id === id ? updated : c)));
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error updating class:', e);
    }
  };

  const deleteClass = async (id: string) => {
    try {
      await apiFetch(`/api/classes/${id}`, { method: 'DELETE' });
      setClasses(prev => {
        const remaining = prev.filter(c => c.id !== id);
        if (selectedClassId === id && remaining.length > 0) {
          setSelectedClassId(remaining[0].id);
        }
        return remaining;
      });
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error deleting class:', e);
    }
  };

  const addStudent = async (newStudentData: Omit<Student, 'id'>) => {
    try {
      const created = await apiFetch('/api/students', {
        method: 'POST',
        body: JSON.stringify(newStudentData),
      });
      setStudents(prev => [...prev, created]);
      setClasses(prev => prev.map(c => (c.id === created.classId ? { ...c, studentCount: c.studentCount + 1 } : c)));
      if (soundEnabled) soundFx.playSuccess();
    } catch (e) {
      console.error('Error adding student:', e);
    }
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    try {
      const updated = await apiFetch(`/api/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setStudents(prev => prev.map(s => (s.id === id ? updated : s)));
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error updating student:', e);
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await apiFetch(`/api/students/${id}`, { method: 'DELETE' });
      const target = students.find(s => s.id === id);
      if (target) {
        setStudents(prev => prev.filter(s => s.id !== id));
        setClasses(prev => prev.map(c => (c.id === target.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c)));
      }
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error deleting student:', e);
    }
  };

  const addTimetableSlot = async (slotData: Omit<TimetableSlot, 'id'>) => {
    try {
      const created = await apiFetch('/api/timetable', {
        method: 'POST',
        body: JSON.stringify(slotData),
      });
      setTimetable(prev => [...prev, created]);
      if (soundEnabled) soundFx.playSuccess();
    } catch (e) {
      console.error('Error adding timetable slot:', e);
    }
  };

  const updateTimetableSlot = async (id: string, updates: Partial<TimetableSlot>) => {
    try {
      const updated = await apiFetch(`/api/timetable/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      setTimetable(prev => prev.map(s => (s.id === id ? updated : s)));
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error updating timetable slot:', e);
    }
  };

  const deleteTimetableSlot = async (id: string) => {
    try {
      await apiFetch(`/api/timetable/${id}`, { method: 'DELETE' });
      setTimetable(prev => prev.filter(s => s.id !== id));
      if (soundEnabled) soundFx.playTap();
    } catch (e) {
      console.error('Error deleting timetable slot:', e);
    }
  };

  const allAssignedTeacherSlots = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'manager') return timetable;
    return timetable.filter(
      s =>
        s.teacherId === currentUser.teacherId ||
        s.substituteTeacherId === currentUser.id ||
        s.substituteTeacherId === currentUser.teacherId ||
        (s.substituteTeacherName &&
          (s.substituteTeacherName === currentUser.name ||
            currentUser.name.includes(s.substituteTeacherName) ||
            s.substituteTeacherName.includes(currentUser.name))) ||
        (currentUser.assignedClasses && currentUser.assignedClasses.includes(s.classId))
    );
  }, [currentUser, timetable]);

  const currentTeacherSlot = useMemo(() => {
    if (!currentUser || currentUser.role !== 'teacher') return null;

    const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
    };
    const jsDay = new Date().getDay();
    const todayName = daysMap[jsDay] || 'الأحد';

    const teacherSlotsToday = timetable.filter(
      s =>
        s.day === todayName &&
        (s.teacherId === currentUser.teacherId ||
          s.substituteTeacherId === currentUser.id ||
          s.substituteTeacherId === currentUser.teacherId ||
          (s.substituteTeacherName &&
            (s.substituteTeacherName === currentUser.name ||
              currentUser.name.includes(s.substituteTeacherName) ||
              s.substituteTeacherName.includes(currentUser.name))) ||
          (currentUser.assignedClasses && currentUser.assignedClasses.includes(s.classId)))
    );

    if (teacherSlotsToday.length === 0) return null;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of teacherSlotsToday) {
      const timing = periodTimings.find(pt => pt.periodNumber === slot.periodNumber);
      if (timing) {
        const [startH, startM] = timing.startTime.split(':').map(Number);
        const [endH, endM] = timing.endTime.split(':').map(Number);
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;

        if (nowMinutes >= startMin - 10 && nowMinutes <= endMin + 15) {
          return slot;
        }
      }
    }

    return teacherSlotsToday[0] || null;
  }, [currentUser, timetable, periodTimings]);

  const canUserEditAttendance = (classId: string, periodNumber: number): { allowed: boolean; reason?: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'يرجى تسجيل الدخول لتتمكن من رصد الحضور.' };
    }
    if (settings.emergencyLockdown) {
      return { allowed: false, reason: '⚠️ النظام في حالة إغلاق طارئ مؤقت يمنع رصد أو تعديل السجلات.' };
    }

    if (currentUser.role !== 'manager' && settings.editingDeadlineEnabled && settings.editingDeadline) {
      const now = new Date();
      const [dH, dM] = settings.editingDeadline.split(':').map(Number);
      const deadlineMin = dH * 60 + (dM || 0);
      const currentMin = now.getHours() * 60 + now.getMinutes();
      if (currentMin > deadlineMin) {
        return {
          allowed: false,
          reason: `⚠️ تم تجاوز الموعد النهائي المحدد من إدارة المدرسة لتعديل الحضور (${settings.editingDeadline}). لا يمكن إجراء تعديلات بعد هذا الموعد.`,
        };
      }
    }

    if (currentUser.role === 'manager' || currentUser.permissions?.canEditAnyAttendance) {
      return { allowed: true };
    }

    const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
    };
    const jsDay = new Date().getDay();
    const todayName = daysMap[jsDay] || 'الأحد';

    const slot = timetable.find(
      s => s.day === todayName && s.classId === classId && s.periodNumber === periodNumber
    );

    if (slot) {
      if (
        (slot.teacherId && slot.teacherId === currentUser.teacherId) ||
        (slot.substituteTeacherId && (slot.substituteTeacherId === currentUser.id || slot.substituteTeacherId === currentUser.teacherId)) ||
        (slot.substituteTeacherName &&
          (slot.substituteTeacherName === currentUser.name ||
            currentUser.name.includes(slot.substituteTeacherName) ||
            slot.substituteTeacherName.includes(currentUser.name)))
      ) {
        return { allowed: true };
      }
      if (slot.teacherId && slot.teacherId !== currentUser.teacherId && !slot.substituteTeacherId && !slot.substituteTeacherName) {
        return {
          allowed: false,
          reason: `هذه الحصة (${slot.subject}) مسندة إلى (${slot.teacherName || 'معلم آخر'}). بصفتك معلماً، يمكنك فقط رصد حصصك أو الحصص المكلف بها كمعلم بديل، ولا يمكن تعديل حصص المعلمين الآخرين إلا من قبل مدير المدرسة.`,
        };
      }
    }

    if (currentUser.assignedClasses && currentUser.assignedClasses.includes(classId)) {
      const otherSlot = timetable.find(
        s => s.classId === classId && s.periodNumber === periodNumber && s.teacherId && s.teacherId !== currentUser.teacherId
      );
      if (otherSlot) {
        return {
          allowed: false,
          reason: `هذه الحصة مسندة إلى المعلم (${otherSlot.teacherName}). الصلاحية مقتصرة على معلم المادة أو المدير.`,
        };
      }
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'أنت غير مسند لهذا الفصل أو هذه الحصة. الصلاحية مقتصرة على معلم الفصل المعتمد أو مدير المدرسة.',
    };
  };

  const overallStats = useMemo(() => {
    const totalStudents = students.length;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalExcused = 0;

    classes.forEach(c => {
      const key = `${c.id}_${currentDate}_p${selectedPeriod}`;
      const recs = attendanceMap[key];
      const classStudents = students.filter(s => s.classId === c.id);

      classStudents.forEach(st => {
        const entry = recs ? recs[st.id] : null;
        const status = entry?.status || 'present';
        if (status === 'present') totalPresent++;
        else if (status === 'absent') totalAbsent++;
        else if (status === 'late') totalLate++;
        else if (status === 'excused') totalExcused++;
      });
    });

    const attendanceRate = totalStudents > 0 ? Math.round(((totalPresent + totalLate) / totalStudents) * 100) : 100;
    const submittedCount = Object.keys(submittedSessions).filter(k => k.includes(currentDate)).length;
    const pendingClassesCount = Math.max(0, classes.length - submittedCount);

    return {
      totalStudents,
      totalPresent,
      totalAbsent,
      totalLate,
      totalExcused,
      attendanceRate,
      pendingClassesCount,
    };
  }, [students, classes, currentDate, selectedPeriod, attendanceMap, submittedSessions]);

  return (
    <AttendanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentUser,
        users,
        login,
        registerUser,
        logout,
        switchUser,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        periodTimings,
        updatePeriodTiming,
        classes,
        addClass,
        updateClass,
        deleteClass,
        selectedClassId,
        setSelectedClassId: handleSelectClass,
        selectedPeriod,
        setSelectedPeriod,
        currentDate,
        setCurrentDate,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        medicalExcuses,
        uploadMedicalExcuse,
        getStudentExcuse,
        deleteMedicalExcuse,
        activeClass,
        activeStudents,
        currentSessionKey,
        currentRecords,
        isCurrentSessionSubmitted,
        currentSessionMeta,
        submittedSessions,
        isSessionSubmitted,
        getSessionMeta,
        attendanceChangeCount,
        canUserEditAttendance,
        setStudentStatus,
        markAllPresent,
        resetAttendanceSession,
        submitAttendanceSession,
        reopenAttendanceSession,
        timetable,
        addTimetableSlot,
        updateTimetableSlot,
        deleteTimetableSlot,
        currentTeacherSlot,
        allAssignedTeacherSlots,
        staff,
        updateStaffRole,
        settings,
        updateSetting,
        toggleEmergencyLockdown,
        notifications,
        addNotification,
        triggerTestAlert,
        dismissNotification,
        clearAllNotifications,
        requestNotificationPermission,
        fastLoadMode,
        setFastLoadMode,
        soundEnabled,
        setSoundEnabled,
        theme,
        setTheme,
        toggleTheme,
        overallStats,
        lastSavedAt,
        quickAddStudentNote,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
