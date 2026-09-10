import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_STAFF,
  INITIAL_TIMETABLE,
  INITIAL_SETTINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PERIOD_TIMINGS,
} from './data/mockData';

const db = new Database('database.sqlite');
db.pragma('journal_mode = WAL');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
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
      grade_level TEXT,
      room TEXT,
      homeroom_teacher TEXT,
      student_count INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      national_id TEXT,
      seat_number INTEGER,
      class_id TEXT NOT NULL,
      avatar_seed TEXT,
      parent_name TEXT,
      parent_phone TEXT,
      guardian_phone TEXT,
      consecutive_absences INTEGER DEFAULT 0,
      health_note TEXT,
      academic_note TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_sessions (
      id TEXT PRIMARY KEY,
      class_id TEXT NOT NULL,
      period_number INTEGER NOT NULL,
      date TEXT NOT NULL,
      is_submitted INTEGER DEFAULT 0,
      submitted_at TEXT,
      submitted_by_user_id TEXT,
      submitted_teacher_name TEXT,
      UNIQUE(class_id, period_number, date),
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      status TEXT NOT NULL,
      note TEXT,
      excuse_id TEXT,
      updated_at TEXT,
      UNIQUE(session_id, student_id),
      FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS medical_excuses (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      image_url TEXT NOT NULL,
      file_name TEXT,
      uploaded_at TEXT,
      uploaded_by TEXT,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS timetable_slots (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      period_number INTEGER NOT NULL,
      time_range TEXT,
      subject TEXT NOT NULL,
      class_id TEXT NOT NULL,
      class_name TEXT,
      room TEXT,
      teacher_id TEXT,
      teacher_name TEXT,
      substitute_teacher_id TEXT,
      substitute_teacher_name TEXT,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS period_timings (
      period_number INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      attendance_allowed_from TEXT,
      attendance_allowed_until TEXT,
      window_minutes INTEGER
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
      enable_push_notifications INTEGER DEFAULT 1,
      require_excuse_image INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      class_id TEXT,
      read INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      subject_or_dept TEXT,
      phone TEXT,
      status TEXT NOT NULL,
      assigned_classes TEXT
    );
  `);

  // Seed Users if empty
  const userCount = (db.prepare('SELECT COUNT(*) as count FROM users').get() as any).count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password, name, role, teacher_id, subject, phone, assigned_classes, permissions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const u of INITIAL_USERS) {
      const hashedPassword = bcrypt.hashSync(u.password, 10);
      insertUser.run(
        u.id,
        u.username,
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
  }

  // Seed Classes if empty
  const classCount = (db.prepare('SELECT COUNT(*) as count FROM classes').get() as any).count;
  if (classCount === 0) {
    const insertClass = db.prepare(`
      INSERT INTO classes (id, name, grade_level, room, homeroom_teacher, student_count)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const c of INITIAL_CLASSES) {
      insertClass.run(c.id, c.name, c.gradeLevel, c.room, c.homeroomTeacher, c.studentCount);
    }
  }

  // Seed Students if empty
  const studentCount = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
  if (studentCount === 0) {
    const insertStudent = db.prepare(`
      INSERT INTO students (id, name, national_id, seat_number, class_id, avatar_seed, parent_name, parent_phone, guardian_phone, consecutive_absences, health_note, academic_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of INITIAL_STUDENTS) {
      insertStudent.run(
        s.id,
        s.name,
        s.nationalId || null,
        s.seatNumber,
        s.classId,
        s.avatarSeed,
        s.parentName,
        s.parentPhone,
        s.guardianPhone || null,
        s.consecutiveAbsences || 0,
        s.healthNote || null,
        s.academicNote || null
      );
    }
  }

  // Seed Staff if empty
  const staffCount = (db.prepare('SELECT COUNT(*) as count FROM staff').get() as any).count;
  if (staffCount === 0) {
    const insertStaff = db.prepare(`
      INSERT INTO staff (id, name, role, subject_or_dept, phone, status, assigned_classes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const st of INITIAL_STAFF) {
      insertStaff.run(
        st.id,
        st.name,
        st.role,
        st.subjectOrDept,
        st.phone,
        st.status,
        JSON.stringify(st.assignedClasses || [])
      );
    }
  }

  // Seed Timetable if empty
  const ttCount = (db.prepare('SELECT COUNT(*) as count FROM timetable_slots').get() as any).count;
  if (ttCount === 0) {
    const insertTT = db.prepare(`
      INSERT INTO timetable_slots (id, day, period_number, time_range, subject, class_id, class_name, room, teacher_id, teacher_name, substitute_teacher_id, substitute_teacher_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const tt of INITIAL_TIMETABLE) {
      insertTT.run(
        tt.id,
        tt.day,
        tt.periodNumber,
        tt.timeRange,
        tt.subject,
        tt.classId,
        tt.className,
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
      INSERT INTO period_timings (period_number, name, start_time, end_time, attendance_allowed_from, attendance_allowed_until, window_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
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
      INSERT INTO system_settings (id, school_name, editing_deadline, editing_deadline_enabled, emergency_lockdown, lockdown_time, enable_sms_alerts, pause_alerts_on_holidays, default_all_present, allow_offline_mode, enable_push_notifications, require_excuse_image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      1,
      0
    );
  }

  // Seed Notifications if empty
  const notifCount = (db.prepare('SELECT COUNT(*) as count FROM notifications').get() as any).count;
  if (notifCount === 0) {
    const insertNotif = db.prepare(`
      INSERT INTO notifications (id, title, message, time, type, class_id, read)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const n of INITIAL_NOTIFICATIONS) {
      insertNotif.run(
        n.id,
        n.title,
        n.message,
        n.time,
        n.type,
        n.classId || null,
        n.read ? 1 : 0
      );
    }
  }

  // Seed initial today session if empty
  const sessionCount = (db.prepare('SELECT COUNT(*) as count FROM attendance_sessions').get() as any).count;
  if (sessionCount === 0) {
    const today = new Date().toISOString().split('T')[0];
    const sessionId = `session-class-9th-${today}-1`;
    db.prepare(`
      INSERT INTO attendance_sessions (id, class_id, period_number, date, is_submitted, submitted_at, submitted_by_user_id, submitted_teacher_name)
      VALUES (?, ?, ?, ?, 0, null, null, null)
    `).run(sessionId, 'class-9th', 1, today);

    const insertRecord = db.prepare(`
      INSERT INTO attendance_records (id, session_id, student_id, status, note, excuse_id, updated_at)
      VALUES (?, ?, ?, ?, ?, null, ?)
    `);

    const studentsIn9th = db.prepare("SELECT id FROM students WHERE class_id = 'class-9th'").all() as { id: string }[];
    studentsIn9th.forEach((s, idx) => {
      let status = 'present';
      if (idx === 1) status = 'absent';
      if (idx === 3) status = 'late';
      insertRecord.run(`rec-${sessionId}-${s.id}`, sessionId, s.id, status, null, new Date().toISOString());
    });
  }
}

export default db;
