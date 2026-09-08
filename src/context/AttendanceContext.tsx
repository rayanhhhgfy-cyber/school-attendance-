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
import {
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_TIMETABLE,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  INITIAL_PERIOD_TIMINGS,
} from '../data/mockData';
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
  login: (username: string, password: string) => { success: boolean; message?: string };
  registerUser: (userData: Omit<UserAccount, 'id'>) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  addUserAccount: (user: Omit<UserAccount, 'id'>) => void;
  updateUserAccount: (id: string, updates: Partial<UserAccount>) => void;
  deleteUserAccount: (id: string) => void;

  // Period timings
  periodTimings: PeriodTimingConfig[];
  updatePeriodTiming: (periodNumber: number, updates: Partial<PeriodTimingConfig>) => void;

  // Class & Session selection
  classes: SchoolClass[];
  addClass: (cls: Omit<SchoolClass, 'id'>) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedPeriod: number;
  setSelectedPeriod: (period: number) => void;
  currentDate: string;
  setCurrentDate: (date: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Medical Excuses
  medicalExcuses: MedicalExcuse[];
  uploadMedicalExcuse: (studentId: string, date: string, imageUrl: string, fileName?: string) => void;
  getStudentExcuse: (studentId: string, date?: string) => MedicalExcuse | undefined;
  deleteMedicalExcuse: (id: string) => void;

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
  resetAttendanceSession: () => void;
  submitAttendanceSession: () => { present: number; absent: number; late: number; excused: number };
  reopenAttendanceSession: () => void;

  // Timetable
  timetable: TimetableSlot[];
  addTimetableSlot: (slot: Omit<TimetableSlot, 'id'>) => void;
  updateTimetableSlot: (id: string, updates: Partial<TimetableSlot>) => void;
  deleteTimetableSlot: (id: string) => void;
  currentTeacherSlot: TimetableSlot | null;
  allAssignedTeacherSlots: TimetableSlot[];

  // Admin & Staff
  staff: StaffMember[];
  updateStaffRole: (staffId: string, role: StaffRole) => void;
  settings: SystemSettings;
  updateSetting: (key: keyof SystemSettings, val: any) => void;
  toggleEmergencyLockdown: (reason?: string) => void;

  // Alerts & Notifications
  notifications: AppNotification[];
  addNotification: (title: string, message: string, type?: 'reminder' | 'warning' | 'info', classId?: string) => void;
  triggerTestAlert: (classId?: string, customMessage?: string) => void;
  dismissNotification: (id: string) => void;
  clearAllNotifications: () => void;
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

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<'take_attendance' | 'todays_attendance' | 'dashboard' | 'timetable' | 'history' | 'students' | 'settings'>('take_attendance');

  // Users & Authentication
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasOldClasses = parsed.some(u => u.assignedClasses?.some(c => c.includes('class-1a') || c.includes('class-2b')));
          if (!hasOldClasses) return parsed;
        }
      } catch {}
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Period Timings
  const [periodTimings, setPeriodTimings] = useState<PeriodTimingConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'period_timings');
    return saved ? JSON.parse(saved) : INITIAL_PERIOD_TIMINGS;
  });

  // Classes & Students
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'classes');
    if (saved) {
      try {
        const parsed: SchoolClass[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(c => c.id === 'class-1a' || c.name.includes('الأول'))) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_CLASSES;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'students');
    if (saved) {
      try {
        const parsed: Student[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(s => s.classId === 'class-1a')) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_STUDENTS;
  });

  const [selectedClassId, setSelectedClassId] = useState<string>('class-9th');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [currentDate, setCurrentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Medical Excuses
  const [medicalExcuses, setMedicalExcuses] = useState<MedicalExcuse[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'medical_excuses');
    return saved ? JSON.parse(saved) : [];
  });

  // Attendance Change Count (track how many times attendance has been changed/saved)
  const [attendanceChangeCount, setAttendanceChangeCount] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'change_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Attendance Records mapped by: `${classId}_${date}_p${period}` -> { [studentId]: AttendanceEntry }
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, AttendanceEntry>>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    // Seed initial session for today
    const today = new Date().toISOString().split('T')[0];
    const initialMap: Record<string, Record<string, AttendanceEntry>> = {};
    
    // Default everyone in 9th grade to present, with 1 absent and 1 late for realistic pulse
    const key = `class-9th_${today}_p1`;
    const records: Record<string, AttendanceEntry> = {};
    INITIAL_STUDENTS.filter(s => s.classId === 'class-9th').forEach((s, idx) => {
      let status: AttendanceStatus = 'present';
      if (idx === 1) status = 'absent';
      if (idx === 3) status = 'late';
      records[s.id] = {
        studentId: s.id,
        status,
        updatedAt: new Date().toISOString(),
      };
    });
    initialMap[key] = records;
    return initialMap;
  });

  // Submitted session metadata
  const [submittedSessions, setSubmittedSessions] = useState<Record<string, SessionMeta>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'submitted_sessions');
    return saved ? JSON.parse(saved) : {};
  });

  // Staff
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'staff');
    if (saved) {
      try {
        const parsed: StaffMember[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(s => s.assignedClasses?.includes('class-1a'))) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_STAFF;
  });

  // Timetable
  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'timetable');
    if (saved) {
      try {
        const parsed: TimetableSlot[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(t => t.classId === 'class-1a')) {
          return parsed;
        }
      } catch {}
    }
    return INITIAL_TIMETABLE;
  });

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'settings');
    const defaultSet: SystemSettings = {
      ...INITIAL_SETTINGS,
      schoolName: 'مدرسة الملك حسين بن طلال الثانوية للبنين',
      editingDeadline: '14:00',
      editingDeadlineEnabled: false,
      enablePushNotifications: true,
      requireExcuseImage: false,
    };
    return saved ? { ...defaultSet, ...JSON.parse(saved) } : defaultSet;
  });

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Preferences
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', newTheme);
    } catch {
      // ignore
    }
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

  const [fastLoadMode, setFastLoadModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'fast_load');
    return saved ? JSON.parse(saved) : false;
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'sound');
    return saved ? JSON.parse(saved) : true;
  });

  const [lastSavedAt, setLastSavedAt] = useState<string>('الآن محلياً');

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
      }
      localStorage.setItem(STORAGE_KEY_PREFIX + 'period_timings', JSON.stringify(periodTimings));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'records', JSON.stringify(attendanceMap));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'submitted_sessions', JSON.stringify(submittedSessions));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'medical_excuses', JSON.stringify(medicalExcuses));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'change_count', attendanceChangeCount.toString());
      localStorage.setItem(STORAGE_KEY_PREFIX + 'classes', JSON.stringify(classes));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'students', JSON.stringify(students));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'timetable', JSON.stringify(timetable));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'staff', JSON.stringify(staff));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'settings', JSON.stringify(settings));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'fast_load', JSON.stringify(fastLoadMode));
      localStorage.setItem(STORAGE_KEY_PREFIX + 'sound', JSON.stringify(soundEnabled));
      
      const timeStr = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(timeStr);
    } catch {
      // Storage quota or private mode fallback
    }
  }, [users, currentUser, periodTimings, attendanceMap, submittedSessions, medicalExcuses, attendanceChangeCount, classes, students, timetable, staff, settings, notifications, fastLoadMode, soundEnabled]);

  // Derived current session key
  const currentSessionKey = useMemo(() => {
    return `${selectedClassId}_${currentDate}_p${selectedPeriod}`;
  }, [selectedClassId, currentDate, selectedPeriod]);

  // Active Class object
  const activeClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
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
    // Smart Attendance by Exception: default all students to present
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

  // Medical Excuses methods
  const uploadMedicalExcuse = (studentId: string, date: string, imageUrl: string, fileName?: string) => {
    const id = 'excuse-' + Date.now();
    const newExcuse: MedicalExcuse = {
      id,
      studentId,
      date,
      imageUrl,
      fileName,
      uploadedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      uploadedBy: currentUser?.name || 'المعلم',
    };

    setMedicalExcuses(prev => [newExcuse, ...prev.filter(e => !(e.studentId === studentId && e.date === date))]);

    // Automatically update student status to excused if in current session
    setStudentStatus(studentId, 'excused', 'تم إرفاق عذر طبي مصور');

    if (soundEnabled) soundFx.playSuccess();
  };

  const getStudentExcuse = (studentId: string, date: string = currentDate): MedicalExcuse | undefined => {
    return medicalExcuses.find(e => e.studentId === studentId && (e.date === date || !e.date));
  };

  const deleteMedicalExcuse = (id: string) => {
    setMedicalExcuses(prev => prev.filter(e => e.id !== id));
    if (soundEnabled) soundFx.playTap();
  };

  // Helper methods to query submission state for any period
  const isSessionSubmitted = (classId: string, periodNumber: number, date: string = currentDate): boolean => {
    const key = `${classId}_${date}_p${periodNumber}`;
    return !!submittedSessions[key];
  };

  const getSessionMeta = (classId: string, periodNumber: number, date: string = currentDate): SessionMeta | undefined => {
    const key = `${classId}_${date}_p${periodNumber}`;
    return submittedSessions[key];
  };

  // Helper to intelligently resolve the right initial class and period for a teacher
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
      // 1. Check if there is an active slot in session right now by bell schedule
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

      // 2. Find the first unsubmitted slot for today!
      const unsubmittedSlot = teacherSlotsToday.find(
        slot => !customSubmitted[`${slot.classId}_${currentDate}_p${slot.periodNumber}`]
      );
      if (unsubmittedSlot) {
        return { classId: unsubmittedSlot.classId, periodNumber: unsubmittedSlot.periodNumber };
      }

      // 3. Fallback to the first slot today
      return { classId: teacherSlotsToday[0].classId, periodNumber: teacherSlotsToday[0].periodNumber };
    }

    // If teacher has assignedClasses, default to first assigned class
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

  // Automatically align teacher's class and period whenever currentUser changes
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
  };

  // Mark all students present with one tap
  const markAllPresent = () => {
    if (settings.emergencyLockdown) return;
    if (soundEnabled) soundFx.playSuccess();

    setAttendanceChangeCount(prev => prev + 1);

    setAttendanceMap(prev => {
      const updated: Record<string, AttendanceEntry> = {};
      activeStudents.forEach(st => {
        updated[st.id] = {
          studentId: st.id,
          status: 'present',
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...prev,
        [currentSessionKey]: updated,
      };
    });
  };

  // Reset session
  const resetAttendanceSession = () => {
    if (settings.emergencyLockdown) return;
    if (soundEnabled) soundFx.playTap(350);

    setAttendanceChangeCount(prev => prev + 1);

    setAttendanceMap(prev => {
      const updated: Record<string, AttendanceEntry> = {};
      activeStudents.forEach(st => {
        updated[st.id] = {
          studentId: st.id,
          status: 'present',
          updatedAt: new Date().toISOString(),
        };
      });
      return {
        ...prev,
        [currentSessionKey]: updated,
      };
    });

    setSubmittedSessions(prev => {
      const copy = { ...prev };
      delete copy[currentSessionKey];
      return copy;
    });
  };

  const reopenAttendanceSession = () => {
    setAttendanceChangeCount(prev => prev + 1);
    setSubmittedSessions(prev => {
      const copy = { ...prev };
      delete copy[currentSessionKey];
      return copy;
    });
  };

  // Submit current attendance session
  const submitAttendanceSession = () => {
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

    // Explicitly freeze and persist the records for this session in attendanceMap
    setAttendanceMap(prev => ({
      ...prev,
      [currentSessionKey]: currentRecords,
    }));

    if (soundEnabled) soundFx.playSuccess();

    return { present, absent, late, excused };
  };

  // Staff role modification
  const updateStaffRole = (staffId: string, role: StaffRole) => {
    if (soundEnabled) soundFx.playTap();
    setStaff(prev =>
      prev.map(member => (member.id === staffId ? { ...member, role } : member))
    );
  };

  // System settings modification
  const updateSetting = (key: keyof SystemSettings, val: any) => {
    if (soundEnabled) soundFx.playTap();
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  // Emergency lockdown toggle
  const toggleEmergencyLockdown = (reason?: string) => {
    const nextVal = !settings.emergencyLockdown;
    if (soundEnabled) {
      if (nextVal) soundFx.playAlert();
      else soundFx.playSuccess();
    }
    setSettings(prev => ({
      ...prev,
      emergencyLockdown: nextVal,
      lockdownTime: nextVal ? new Date().toLocaleTimeString('ar-SA') : undefined,
    }));

    // Add alert notification
    addNotification(
      nextVal ? 'إغلاق طوارئ للنظام' : 'إلغاء إغلاق الطوارئ',
      nextVal
        ? `تم تفعيل حظر التعديل الطارئ: ${reason || 'إجراء احترازي إداري لمنع تعديل سجلات الحضور'}`
        : 'تم رفع حظر الطوارئ وإتاحة تسجيل الحضور لجميع المعلمين.',
      nextVal ? 'warning' : 'info'
    );
  };

  // Browser Push Notification Helper
  const sendNativePushNotification = (title: string, message: string) => {
    if (typeof window !== 'undefined' && 'Notification' in window && settings.enablePushNotifications) {
      if (Notification.permission === 'granted') {
        const options = {
          body: message,
          icon: '/icon.svg',
          badge: '/icon.svg',
          dir: 'rtl' as const,
          lang: 'ar',
        };

        try {
          if ('serviceWorker' in navigator) {
            Promise.race([
              navigator.serviceWorker.ready,
              new Promise((_, reject) => setTimeout(() => reject(new Error('SW timeout')), 500))
            ]).then((reg: any) => {
              reg.showNotification(title, options).catch(() => {
                new Notification(title, options);
              });
            }).catch(() => {
              new Notification(title, options);
            });
          } else {
            new Notification(title, options);
          }
        } catch (e) {
          try {
            new Notification(title, options);
          } catch (err) {
            console.error('Push notification failed:', err);
          }
        }
      }
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        sendNativePushNotification('تفعيل التنبيهات المنبثقة', 'تم تفعيل التنبيهات المدرسية المنبثقة بنجاح.');
        return true;
      }
    }
    return false;
  };

  // Add custom notification
  const addNotification = (
    title: string,
    message: string,
    type: 'reminder' | 'warning' | 'info' = 'reminder',
    classId?: string
  ) => {
    if (soundEnabled) soundFx.playAlert();
    const alertId = 'notif-' + Date.now();
    const newNotif: AppNotification = {
      id: alertId,
      title,
      message,
      time: 'الآن',
      type,
      classId,
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    sendNativePushNotification(title, message);
  };

  // Trigger test smart alert (5 min before class)
  const triggerTestAlert = (classId = 'class-9th', customMessage?: string) => {
    if (soundEnabled) soundFx.playAlert();
    const targetClass = classes.find(c => c.id === classId) || classes[0];
    const title = 'تنبيه ذكي: موعد الحصة القادمة';
    const message = customMessage || `تبدأ الحصة القادمة لـ (${targetClass.name}) خلال 5 دقائق. يرجى رصد الحضور.`;

    addNotification(title, message, 'reminder', targetClass.id);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const setFastLoadMode = (mode: boolean) => {
    if (soundEnabled) soundFx.playTap();
    setFastLoadModeState(mode);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
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
  };

  // Authentication methods
  const login = (username: string, password: string): { success: boolean; message?: string } => {
    const trimmedUser = username.trim().toLowerCase();
    const found = users.find(
      u => u.username.toLowerCase() === trimmedUser && u.password === password
    );
    if (!found) {
      if (soundEnabled) soundFx.playAlert();
      return {
        success: false,
        message: 'اسم المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.',
      };
    }
    sessionStorage.setItem(STORAGE_KEY_PREFIX + 'session_active', 'true');
    setCurrentUser(found);

    // Auto-select the teacher's designated slot (class & period) for today
    if (found.role === 'teacher') {
      const slot = resolveTeacherSlot(found);
      if (slot) {
        setSelectedClassId(slot.classId);
        setSelectedPeriod(slot.periodNumber);
      }
    }

    if (soundEnabled) soundFx.playSuccess();
    return { success: true };
  };

  const registerUser = (userData: Omit<UserAccount, 'id'>) => {
    // Check if username already exists
    const cleanUsername = userData.username.trim().toLowerCase();
    if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم مستخدم آخر.' };
    }
    const id = 'user-' + Date.now();
    const newUser: UserAccount = {
      ...userData,
      username: userData.username.trim(),
      id,
    };
    setUsers(prev => [newUser, ...prev]);
    sessionStorage.setItem(STORAGE_KEY_PREFIX + 'session_active', 'true');
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(newUser));
    } catch {}
    setCurrentUser(newUser);

    if (newUser.role === 'teacher') {
      const slot = resolveTeacherSlot(newUser);
      if (slot) {
        setSelectedClassId(slot.classId);
        setSelectedPeriod(slot.periodNumber);
      }
    }

    if (soundEnabled) soundFx.playSuccess();
    return { success: true };
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY_PREFIX + 'session_active');
    try {
      localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user');
    } catch {
      // ignore
    }
    setCurrentUser(null);
    setSelectedPeriod(1);
    setSelectedClassId(classes[0]?.id || 'class-9th');
    if (soundEnabled) soundFx.playTap();
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
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

  const addUserAccount = (newUserData: Omit<UserAccount, 'id'>) => {
    const id = 'user-' + Date.now();
    const newUser: UserAccount = { ...newUserData, id };
    setUsers(prev => [newUser, ...prev]);
    if (soundEnabled) soundFx.playSuccess();
  };

  const updateUserAccount = (id: string, updates: Partial<UserAccount>) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, ...updates } : u))
    );
    if (currentUser?.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updates } : null));
    }
    if (soundEnabled) soundFx.playTap();
  };

  const deleteUserAccount = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    if (soundEnabled) soundFx.playTap();
  };

  // Period Timings management
  const updatePeriodTiming = (periodNumber: number, updates: Partial<PeriodTimingConfig>) => {
    setPeriodTimings(prev =>
      prev.map(pt => (pt.periodNumber === periodNumber ? { ...pt, ...updates } : pt))
    );
    if (soundEnabled) soundFx.playSuccess();
  };

  // Class Management
  const addClass = (newClsData: Omit<SchoolClass, 'id'>): SchoolClass => {
    const id = 'class-' + Date.now();
    const newCls: SchoolClass = {
      studentCount: 0,
      homeroomTeacher: 'غير محدد',
      ...newClsData,
      id,
    };
    setClasses(prev => [...prev, newCls]);
    if (soundEnabled) soundFx.playSuccess();
    return newCls;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setClasses(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
    if (soundEnabled) soundFx.playTap();
  };

  const deleteClass = (id: string) => {
    setClasses(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (selectedClassId === id && remaining.length > 0) {
        setSelectedClassId(remaining[0].id);
      }
      return remaining;
    });
    // Remove class from users' assignedClasses list
    setUsers(prev =>
      prev.map(u => ({
        ...u,
        assignedClasses: u.assignedClasses ? u.assignedClasses.filter(c => c !== id) : undefined,
      }))
    );
    if (soundEnabled) soundFx.playTap();
  };

  // Student Management
  const addStudent = (newStudentData: Omit<Student, 'id'>) => {
    const id = 'st-' + Date.now();
    const newStudent: Student = { ...newStudentData, id };
    setStudents(prev => [...prev, newStudent]);
    // update class count
    setClasses(prev =>
      prev.map(c => (c.id === newStudent.classId ? { ...c, studentCount: c.studentCount + 1 } : c))
    );
    if (soundEnabled) soundFx.playSuccess();
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    if (soundEnabled) soundFx.playTap();
  };

  const deleteStudent = (id: string) => {
    const target = students.find(s => s.id === id);
    if (target) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setClasses(prev =>
        prev.map(c => (c.id === target.classId ? { ...c, studentCount: Math.max(0, c.studentCount - 1) } : c))
      );
    }
    if (soundEnabled) soundFx.playTap();
  };

  // Timetable slot management
  const addTimetableSlot = (slotData: Omit<TimetableSlot, 'id'>) => {
    const id = 'tt-' + Date.now();
    const newSlot: TimetableSlot = { ...slotData, id };
    setTimetable(prev => [...prev, newSlot]);
    if (soundEnabled) soundFx.playSuccess();
  };

  const updateTimetableSlot = (id: string, updates: Partial<TimetableSlot>) => {
    setTimetable(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
    if (soundEnabled) soundFx.playTap();
  };

  const deleteTimetableSlot = (id: string) => {
    setTimetable(prev => prev.filter(s => s.id !== id));
    if (soundEnabled) soundFx.playTap();
  };

  // Teacher Schedule & Active Class Detection
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

  // Current slot where the teacher should be right now
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

    // Check against current time HH:MM
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of teacherSlotsToday) {
      const timing = periodTimings.find(pt => pt.periodNumber === slot.periodNumber);
      if (timing) {
        const [startH, startM] = timing.startTime.split(':').map(Number);
        const [endH, endM] = timing.endTime.split(':').map(Number);
        const startMin = startH * 60 + startM;
        const endMin = endH * 60 + endM;

        // If currently in period or within 10 min window
        if (nowMinutes >= startMin - 10 && nowMinutes <= endMin + 15) {
          return slot;
        }
      }
    }

    // Default to first slot of today if school not active right now
    return teacherSlotsToday[0] || null;
  }, [currentUser, timetable, periodTimings]);

  // Authorization check for modifying attendance
  const canUserEditAttendance = (classId: string, periodNumber: number): { allowed: boolean; reason?: string } => {
    if (!currentUser) {
      return { allowed: false, reason: 'يرجى تسجيل الدخول لتتمكن من رصد الحضور.' };
    }
    if (settings.emergencyLockdown) {
      return { allowed: false, reason: '⚠️ النظام في حالة إغلاق طارئ مؤقت يمنع رصد أو تعديل السجلات.' };
    }

    // Manager deadline enforcement
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
      // Manager or teacher with granted permission has unrestricted access across all classes & periods
      return { allowed: true };
    }

    // Teacher check
    // Determine active day in timetable
    const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
    };
    const jsDay = new Date().getDay();
    const todayName = daysMap[jsDay] || 'الأحد';

    // Find slot for this day, class, and period
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

    // If slot not specifically designated with a different teacher, check assigned classes
    if (currentUser.assignedClasses && currentUser.assignedClasses.includes(classId)) {
      // Check if there is any other teacher slot for this exact period
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

    // Aggregate today's records for all classes
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
    
    // Count pending classes today
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
