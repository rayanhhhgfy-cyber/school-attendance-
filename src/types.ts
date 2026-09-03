/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface Student {
  id: string;
  name: string;
  nationalId: string;
  seatNumber: number;
  classId: string;
  avatarSeed: string;
  parentName: string;
  parentPhone: string;
  guardianPhone?: string;
  consecutiveAbsences: number;
  healthNote?: string;
  academicNote?: string;
}

export interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface ClassAttendanceSession {
  classId: string;
  date: string; // YYYY-MM-DD
  period: number;
  records: Record<string, AttendanceEntry>; // studentId -> record
  isSubmitted: boolean;
  submittedAt?: string;
  submittedBy?: string;
}

export interface SchoolClass {
  id: string;
  name: string;
  gradeLevel: string;
  room: string;
  homeroomTeacher: string;
  studentCount: number;
}

export type StaffRole = 'admin' | 'supervisor' | 'teacher';

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  subjectOrDept: string;
  phone: string;
  status: 'نشط' | 'في إجازة';
  assignedClasses: string[];
}

export interface TimetableSlot {
  id: string;
  day: 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس';
  periodNumber: number;
  timeRange: string;
  subject: string;
  classId: string;
  className: string;
  room: string;
  teacherId?: string;
  teacherName?: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'manager' | 'teacher';
  teacherId?: string;
  assignedClasses?: string[];
  phone?: string;
  subject?: string;
}

export interface PeriodTimingConfig {
  periodNumber: number;
  name: string;
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "08:45"
  attendanceAllowedFrom: string; // e.g. "07:55"
  attendanceAllowedUntil: string; // e.g. "08:30"
  windowMinutes: number; // e.g. 30
}

export interface SystemSettings {
  enableSmsAlerts: boolean;
  pauseAlertsOnHolidays: boolean;
  defaultAllPresent: boolean;
  allowOfflineMode: boolean;
  lockEditingAfterPeriod: boolean;
  emergencyLockdown: boolean;
  lockdownTime?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'reminder' | 'warning' | 'info';
  classId?: string;
  read: boolean;
}

