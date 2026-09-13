import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_TIMETABLE,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERIOD_TIMINGS,
} from '../src/data/mockData';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
let dbPath = path.resolve(process.cwd(), 'database.sqlite');

if (isServerless) {
  const tmpPath = '/tmp/database.sqlite';
  if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
    try {
      // Checkpoint WAL in source DB before copying to /tmp
      const tempDb = new Database(dbPath);
      tempDb.pragma('wal_checkpoint(TRUNCATE)');
      tempDb.close();
      fs.copyFileSync(dbPath, tmpPath);
    } catch (e) {
      console.error('Failed to copy sqlite file to /tmp:', e);
    }
  }
  dbPath = tmpPath;
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

function ensureColumn(tableName: string, colName: string, colDef: string) {
  const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
  const exists = tableInfo.some(c => c.name === colName);
  if (!exists) {
    try {
      db.prepare(`ALTER TABLE ${tableName} ADD COLUMN ${colName} ${colDef}`).run();
    } catch (e) {
      console.error(`Failed to add column ${colName} to ${tableName}:`, e);
    }
  }
}

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT,
      password_hash TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      teacher_id TEXT,
      subject TEXT,
      phone TEXT,
      assigned_classes TEXT,
      permissions TEXT
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT,
      grade_level TEXT,
      section TEXT,
      student_count INTEGER DEFAULT 0,
      room_number TEXT,
      room TEXT,
      order_index INTEGER DEFAULT 0,
      homeroom_teacher TEXT
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      full_name TEXT,
      name TEXT NOT NULL,
      roll_number INTEGER,
      seat_number INTEGER,
      national_id TEXT,
      parent_phone TEXT,
      parent_whatsapp TEXT,
      emergency_phone TEXT,
      medical_notes TEXT,
      health_note TEXT,
      academic_note TEXT,
      is_active INTEGER DEFAULT 1,
      order_index INTEGER DEFAULT 0,
      avatar_seed TEXT,
      parent_name TEXT,
      guardian_phone TEXT,
      consecutive_absences INTEGER DEFAULT 0,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      date TEXT NOT NULL,
      period_number INTEGER NOT NULL,
      is_submitted INTEGER DEFAULT 0,
      submitted_at TEXT,
      submitted_by TEXT,
      submitted_by_user_id TEXT,
      submitted_teacher_name TEXT,
      total INTEGER DEFAULT 0,
      present INTEGER DEFAULT 0,
      absent INTEGER DEFAULT 0,
      late INTEGER DEFAULT 0,
      excused INTEGER DEFAULT 0,
      UNIQUE(class_id, period_number, date),
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      session_id TEXT,
      class_id TEXT,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      period_number INTEGER NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      excuse_id TEXT,
      updated_at TEXT,
      updated_by TEXT,
      UNIQUE(session_id, student_id),
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_excuses (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      class_id TEXT,
      date TEXT NOT NULL,
      period_number INTEGER,
      reason TEXT,
      excuse_type TEXT,
      notes TEXT,
      doctor_name TEXT,
      hospital_name TEXT,
      document_url TEXT,
      image_url TEXT,
      file_name TEXT,
      uploaded_at TEXT,
      created_at TEXT,
      uploaded_by TEXT,
      created_by TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS period_timings (
      period_number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_break INTEGER DEFAULT 0,
      attendance_allowed_from TEXT,
      attendance_allowed_until TEXT,
      window_minutes INTEGER
    );

    CREATE TABLE IF NOT EXISTS periods (
      period_number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      is_break INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER DEFAULT 0,
      day TEXT NOT NULL,
      period_number INTEGER NOT NULL,
      class_id TEXT NOT NULL,
      class_name TEXT,
      subject TEXT NOT NULL,
      room_number TEXT,
      room TEXT,
      time_range TEXT,
      teacher_id TEXT,
      teacher_name TEXT,
      substitute_teacher_id TEXT,
      substitute_teacher_name TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id TEXT PRIMARY KEY,
      day_of_week INTEGER DEFAULT 0,
      period_number INTEGER NOT NULL,
      class_id TEXT NOT NULL,
      teacher_id TEXT,
      teacher_name TEXT,
      subject TEXT NOT NULL,
      room_number TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id TEXT PRIMARY KEY,
      school_name TEXT,
      editing_deadline TEXT,
      editing_deadline_enabled INTEGER DEFAULT 0,
      emergency_lockdown INTEGER DEFAULT 0,
      lockdown_time TEXT,
      enable_sms_alerts INTEGER DEFAULT 1,
      pause_alerts_on_holidays INTEGER DEFAULT 1,
      default_all_present INTEGER DEFAULT 1,
      allow_offline_mode INTEGER DEFAULT 1,
      lock_editing_after_period INTEGER DEFAULT 0,
      enable_push_notifications INTEGER DEFAULT 1,
      require_excuse_image INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      created_at TEXT,
      time TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      read INTEGER DEFAULT 0,
      recipient_role TEXT,
      class_id TEXT
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      subject TEXT,
      subject_or_dept TEXT,
      assigned_classes TEXT,
      status TEXT NOT NULL DEFAULT 'نشط'
    );

    CREATE TABLE IF NOT EXISTS sms_logs (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      parent_phone TEXT,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'sms',
      provider TEXT NOT NULL DEFAULT 'none',
      provider_status TEXT NOT NULL DEFAULT 'logged',
      provider_response TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT
    );
  `);

  // Ensure missing columns exist if DB was pre-created
  ensureColumn('users', 'password_hash', 'TEXT');
  ensureColumn('users', 'password', 'TEXT');
  ensureColumn('users', 'teacher_id', 'TEXT');
  ensureColumn('users', 'subject', 'TEXT');
  ensureColumn('users', 'phone', 'TEXT');
  ensureColumn('users', 'assigned_classes', 'TEXT');
  ensureColumn('users', 'permissions', 'TEXT');

  ensureColumn('classes', 'grade', 'TEXT');
  ensureColumn('classes', 'grade_level', 'TEXT');
  ensureColumn('classes', 'section', 'TEXT');
  ensureColumn('classes', 'room_number', 'TEXT');
  ensureColumn('classes', 'room', 'TEXT');
  ensureColumn('classes', 'order_index', 'INTEGER DEFAULT 0');

  ensureColumn('students', 'full_name', 'TEXT');
  ensureColumn('students', 'roll_number', 'INTEGER');
  ensureColumn('students', 'parent_whatsapp', 'TEXT');
  ensureColumn('students', 'emergency_phone', 'TEXT');
  ensureColumn('students', 'medical_notes', 'TEXT');
  ensureColumn('students', 'is_active', 'INTEGER DEFAULT 1');
  ensureColumn('students', 'order_index', 'INTEGER DEFAULT 0');

  ensureColumn('attendance_sessions', 'submitted_by', 'TEXT');
  ensureColumn('attendance_sessions', 'total', 'INTEGER DEFAULT 0');
  ensureColumn('attendance_sessions', 'present', 'INTEGER DEFAULT 0');
  ensureColumn('attendance_sessions', 'absent', 'INTEGER DEFAULT 0');
  ensureColumn('attendance_sessions', 'late', 'INTEGER DEFAULT 0');
  ensureColumn('attendance_sessions', 'excused', 'INTEGER DEFAULT 0');

  ensureColumn('attendance_records', 'class_id', 'TEXT');
  ensureColumn('attendance_records', 'date', 'TEXT');
  ensureColumn('attendance_records', 'period_number', 'INTEGER');
  ensureColumn('attendance_records', 'updated_by', 'TEXT');

  ensureColumn('medical_excuses', 'class_id', 'TEXT');
  ensureColumn('medical_excuses', 'period_number', 'INTEGER');
  ensureColumn('medical_excuses', 'reason', 'TEXT');
  ensureColumn('medical_excuses', 'excuse_type', 'TEXT');
  ensureColumn('medical_excuses', 'notes', 'TEXT');
  ensureColumn('medical_excuses', 'doctor_name', 'TEXT');
  ensureColumn('medical_excuses', 'hospital_name', 'TEXT');
  ensureColumn('medical_excuses', 'document_url', 'TEXT');
  ensureColumn('medical_excuses', 'created_at', 'TEXT');
  ensureColumn('medical_excuses', 'created_by', 'TEXT');

  ensureColumn('period_timings', 'is_break', 'INTEGER DEFAULT 0');

  ensureColumn('timetable_slots', 'day_of_week', 'INTEGER DEFAULT 0');
  ensureColumn('timetable_slots', 'room_number', 'TEXT');

  ensureColumn('system_settings', 'lock_editing_after_period', 'INTEGER DEFAULT 0');

  ensureColumn('staff', 'email', 'TEXT');
  ensureColumn('staff', 'subject', 'TEXT');

  ensureColumn('notifications', 'created_at', 'TEXT');
  ensureColumn('notifications', 'is_read', 'INTEGER DEFAULT 0');
  ensureColumn('notifications', 'recipient_role', 'TEXT');

  // Ensure default users exist
  const insertUser = db.prepare(`
    INSERT INTO users (id, username, password, password_hash, name, role, teacher_id, subject, phone, assigned_classes, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      username = excluded.username,
      password = excluded.password,
      password_hash = excluded.password_hash
  `);

  for (const u of INITIAL_USERS) {
    const hashedPassword = bcrypt.hashSync(u.password, 10);
    insertUser.run(
      u.id,
      u.username,
      hashedPassword,
      hashedPassword,
      u.name,
      u.role,
      u.teacherId || null,
      u.subject || null,
      u.phone || null,
      JSON.stringify(u.assignedClasses || []),
      JSON.stringify(u.permissions || {})
    );
  }

  // Seed Classes if empty
  const classCount = (db.prepare('SELECT COUNT(*) as count FROM classes').get() as any).count;
  if (classCount === 0) {
    const insertClass = db.prepare(`
      INSERT INTO classes (id, name, grade, grade_level, section, room_number, room, homeroom_teacher, student_count, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    INITIAL_CLASSES.forEach((c, idx) => {
      insertClass.run(
        c.id,
        c.name,
        c.gradeLevel,
        c.gradeLevel,
        'أ',
        c.room,
        c.room,
        c.homeroomTeacher,
        c.studentCount,
        idx + 1
      );
    });
  }

  // Seed Students if empty
  const studentCount = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
  if (studentCount === 0) {
    const insertStudent = db.prepare(`
      INSERT INTO students (
        id, class_id, full_name, name, roll_number, seat_number, national_id,
        parent_phone, parent_whatsapp, emergency_phone, medical_notes, health_note, academic_note,
        is_active, order_index, avatar_seed, parent_name, guardian_phone, consecutive_absences
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)
    `);
    INITIAL_STUDENTS.forEach((s, idx) => {
      insertStudent.run(
        s.id,
        s.classId,
        s.name,
        s.name,
        s.seatNumber,
        s.seatNumber,
        s.nationalId || null,
        s.parentPhone,
        s.parentPhone,
        s.parentPhone,
        s.healthNote || null,
        s.healthNote || null,
        s.academicNote || null,
        idx + 1,
        s.avatarSeed,
        s.parentName,
        s.guardianPhone || null,
        s.consecutiveAbsences || 0
      );
    });
  }

  // Seed Staff if empty
  const staffCount = (db.prepare('SELECT COUNT(*) as count FROM staff').get() as any).count;
  if (staffCount === 0) {
    const insertStaff = db.prepare(`
      INSERT INTO staff (id, name, role, email, phone, subject, subject_or_dept, status, assigned_classes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const st of INITIAL_STAFF) {
      insertStaff.run(
        st.id,
        st.name,
        st.role,
        `${st.id}@school.edu`,
        st.phone,
        st.subjectOrDept,
        st.subjectOrDept,
        st.status,
        JSON.stringify(st.assignedClasses || [])
      );
    }
  }

  // Seed Timetable if empty
  const ttCount = (db.prepare('SELECT COUNT(*) as count FROM timetable_slots').get() as any).count;
  if (ttCount === 0) {
    const insertTT = db.prepare(`
      INSERT INTO timetable_slots (id, day_of_week, day, period_number, time_range, subject, class_id, class_name, room_number, room, teacher_id, teacher_name, substitute_teacher_id, substitute_teacher_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const dayToNum: Record<string, number> = { 'الأحد': 0, 'الإثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3, 'الخميس': 4 };
    for (const tt of INITIAL_TIMETABLE) {
      insertTT.run(
        tt.id,
        dayToNum[tt.day] ?? 0,
        tt.day,
        tt.periodNumber,
        tt.timeRange,
        tt.subject,
        tt.classId,
        tt.className,
        tt.room,
        tt.room,
        tt.teacherId || null,
        tt.teacherName || null,
        tt.substituteTeacherId || null,
        tt.substituteTeacherName || null
      );
    }
  }

  // Seed Period Timings if empty
  const ptCount = (db.prepare('SELECT COUNT(*) as count FROM period_timings').get() as any).count;
  if (ptCount === 0) {
    const insertPT = db.prepare(`
      INSERT INTO period_timings (period_number, name, start_time, end_time, is_break, attendance_allowed_from, attendance_allowed_until, window_minutes)
      VALUES (?, ?, ?, ?, 0, ?, ?, ?)
    `);
    for (const pt of INITIAL_PERIOD_TIMINGS) {
      insertPT.run(
        pt.periodNumber,
        pt.name,
        pt.startTime,
        pt.endTime,
        pt.attendanceAllowedFrom,
        pt.attendanceAllowedUntil,
        pt.windowMinutes
      );
    }
  }

  // Seed System Settings if empty
  const settingsCount = (db.prepare('SELECT COUNT(*) as count FROM system_settings').get() as any).count;
  if (settingsCount === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO system_settings (id, school_name, editing_deadline, editing_deadline_enabled, emergency_lockdown, lockdown_time, enable_sms_alerts, pause_alerts_on_holidays, default_all_present, allow_offline_mode, lock_editing_after_period, enable_push_notifications, require_excuse_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertSetting.run(
      'settings',
      'مدرسة الملك حسين بن طلال الثانوية للبنين',
      '14:00',
      0,
      0,
      null,
      INITIAL_SETTINGS.enableSmsAlerts ? 1 : 0,
      INITIAL_SETTINGS.pauseAlertsOnHolidays ? 1 : 0,
      INITIAL_SETTINGS.defaultAllPresent ? 1 : 0,
      INITIAL_SETTINGS.allowOfflineMode ? 1 : 0,
      INITIAL_SETTINGS.lockEditingAfterPeriod ? 1 : 0,
      1,
      0
    );
  }

  // Seed Notifications if empty
  const notifCount = (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any).count;
  if (notifCount === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, title, message, type, created_at, time, is_read, read, recipient_role, class_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, null, ?)
    `);
    const nowISO = new Date().toISOString();
    for (const n of INITIAL_NOTIFICATIONS) {
      insertNotif.run(
        n.id,
        n.title,
        n.message,
        n.type,
        nowISO,
        n.time,
        n.read ? 1 : 0,
        n.read ? 1 : 0,
        n.classId || null
      );
    }
  }
}

// Auto-initialize DB schema and seed data on import
initDb();

export default db;
