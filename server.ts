import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { initDb } from './src/db';
import path from 'path';
import { fileURLToPath } from 'url';

const JWT_SECRET = process.env.JWT_SECRET || 'school_attendance_secret_jwt_key_2025';

initDb();

const app = express();
app.use(express.json({ limit: '50mb' }));

// CORS headers for Vite dev server or standalone frontend
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

export interface AuthRequest extends Request {
  user?: any;
}

// Authentication Middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'يرجى تسجيل الدخول للوصول لهذا المورد.' });
    return;
  }
  next();
}

app.use(authenticateToken);

// Helper to format User DB row
function formatUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    teacherId: row.teacher_id || undefined,
    subject: row.subject || undefined,
    phone: row.phone || undefined,
    assignedClasses: row.assigned_classes ? JSON.parse(row.assigned_classes) : [],
    permissions: row.permissions ? JSON.parse(row.permissions) : {},
  };
}

// Helper to format Class DB row
function formatClass(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    gradeLevel: row.grade_level,
    room: row.room,
    homeroomTeacher: row.homeroom_teacher,
    studentCount: row.student_count,
  };
}

// Helper to format Student DB row
function formatStudent(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    nationalId: row.national_id || undefined,
    seatNumber: row.seat_number,
    classId: row.class_id,
    avatarSeed: row.avatar_seed,
    parentName: row.parent_name,
    parentPhone: row.parent_phone,
    guardianPhone: row.guardian_phone || undefined,
    consecutiveAbsences: row.consecutive_absences || 0,
    healthNote: row.health_note || undefined,
    academicNote: row.academic_note || undefined,
  };
}

// Helper to format Staff DB row
function formatStaff(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    subjectOrDept: row.subject_or_dept,
    phone: row.phone,
    status: row.status,
    assignedClasses: row.assigned_classes ? JSON.parse(row.assigned_classes) : [],
  };
}

// Helper to format Timetable DB row
function formatTimetable(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    day: row.day,
    periodNumber: row.period_number,
    timeRange: row.time_range,
    subject: row.subject,
    classId: row.class_id,
    className: row.class_name,
    room: row.room,
    teacherId: row.teacher_id || undefined,
    teacherName: row.teacher_name || undefined,
    substituteTeacherId: row.substitute_teacher_id || undefined,
    substituteTeacherName: row.substitute_teacher_name || undefined,
  };
}

// ==========================================
// 1. AUTHENTICATION ENDPOINTS (`/api/auth`)
// ==========================================

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ success: false, message: 'يرجى إدخال اسم المستخدم وكلمة المرور.' });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();
  const row = db.prepare('SELECT * FROM users WHERE LOWER(username) = ?').get(cleanUsername) as any;

  if (!row || !bcrypt.compareSync(password.trim(), row.password)) {
    res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة.' });
    return;
  }

  const user = formatUser(row);
  const token = jwt.sign({ id: user!.id, username: user!.username, role: user!.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    user,
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, password, name, role, teacherId, subject, phone, assignedClasses, permissions } = req.body;

  if (!username || !password || !name) {
    res.status(400).json({ success: false, message: 'يرجى ملء كافة البيانات المطلوبة.' });
    return;
  }

  const cleanUsername = username.trim().toLowerCase();
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(cleanUsername);

  if (existing) {
    res.status(400).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر.' });
    return;
  }

  const id = 'user-' + Date.now();
  const hashedPassword = bcrypt.hashSync(password.trim(), 10);

  db.prepare(`
    INSERT INTO users (id, username, password, name, role, teacher_id, subject, phone, assigned_classes, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    username.trim(),
    hashedPassword,
    name,
    role || 'teacher',
    teacherId || null,
    subject || null,
    phone || null,
    JSON.stringify(assignedClasses || []),
    JSON.stringify(permissions || {})
  );

  const newUserRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const user = formatUser(newUserRow);
  const token = jwt.sign({ id: user!.id, username: user!.username, role: user!.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    token,
    user,
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!row) {
    res.status(404).json({ error: 'المستخدم غير موجود.' });
    return;
  }
  res.json({ user: formatUser(row) });
});

// ==========================================
// 2. USERS & STAFF ENDPOINTS
// ==========================================

app.get('/api/users', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM users').all();
  res.json(rows.map(formatUser));
});

app.post('/api/users', (req: Request, res: Response) => {
  const { username, password, name, role, teacherId, subject, phone, assignedClasses, permissions } = req.body;
  const id = 'user-' + Date.now();
  const hashedPassword = bcrypt.hashSync(password || '123', 10);

  db.prepare(`
    INSERT INTO users (id, username, password, name, role, teacher_id, subject, phone, assigned_classes, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    username,
    hashedPassword,
    name,
    role || 'teacher',
    teacherId || null,
    subject || null,
    phone || null,
    JSON.stringify(assignedClasses || []),
    JSON.stringify(permissions || {})
  );

  const newRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json(formatUser(newRow));
});

app.put('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  const { username, password, name, role, teacherId, subject, phone, assignedClasses, permissions } = req.body;

  let hashedPassword = existing.password;
  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }

  db.prepare(`
    UPDATE users
    SET username = ?, password = ?, name = ?, role = ?, teacher_id = ?, subject = ?, phone = ?, assigned_classes = ?, permissions = ?
    WHERE id = ?
  `).run(
    username !== undefined ? username : existing.username,
    hashedPassword,
    name !== undefined ? name : existing.name,
    role !== undefined ? role : existing.role,
    teacherId !== undefined ? teacherId : existing.teacher_id,
    subject !== undefined ? subject : existing.subject,
    phone !== undefined ? phone : existing.phone,
    assignedClasses !== undefined ? JSON.stringify(assignedClasses) : existing.assigned_classes,
    permissions !== undefined ? JSON.stringify(permissions) : existing.permissions,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json(formatUser(updatedRow));
});

app.delete('/api/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true, id });
});

app.get('/api/staff', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM staff').all();
  res.json(rows.map(formatStaff));
});

app.put('/api/staff/:id/role', (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status } = req.body;
  if (role) {
    db.prepare('UPDATE staff SET role = ? WHERE id = ?').run(role, id);
  }
  if (status) {
    db.prepare('UPDATE staff SET status = ? WHERE id = ?').run(status, id);
  }
  const updatedRow = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
  res.json(formatStaff(updatedRow));
});

// ==========================================
// 3. CLASSES ENDPOINTS
// ==========================================

app.get('/api/classes', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM classes').all();
  res.json(rows.map(formatClass));
});

app.post('/api/classes', (req: Request, res: Response) => {
  const { name, gradeLevel, room, homeroomTeacher, studentCount } = req.body;
  const id = 'class-' + Date.now();

  db.prepare(`
    INSERT INTO classes (id, name, grade_level, room, homeroom_teacher, student_count)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, name, gradeLevel, room, homeroomTeacher || 'غير محدد', studentCount || 0);

  const newRow = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
  res.json(formatClass(newRow));
});

app.put('/api/classes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الفصل غير موجود' });
    return;
  }

  const { name, gradeLevel, room, homeroomTeacher, studentCount } = req.body;

  db.prepare(`
    UPDATE classes
    SET name = ?, grade_level = ?, room = ?, homeroom_teacher = ?, student_count = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    gradeLevel !== undefined ? gradeLevel : existing.grade_level,
    room !== undefined ? room : existing.room,
    homeroomTeacher !== undefined ? homeroomTeacher : existing.homeroom_teacher,
    studentCount !== undefined ? studentCount : existing.student_count,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
  res.json(formatClass(updatedRow));
});

app.delete('/api/classes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM classes WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// ==========================================
// 4. STUDENTS ENDPOINTS
// ==========================================

app.get('/api/students', (req: Request, res: Response) => {
  const { classId } = req.query;
  let rows;
  if (classId) {
    rows = db.prepare('SELECT * FROM students WHERE class_id = ? ORDER BY seat_number ASC').all(classId);
  } else {
    rows = db.prepare('SELECT * FROM students ORDER BY class_id, seat_number ASC').all();
  }
  res.json(rows.map(formatStudent));
});

app.post('/api/students', (req: Request, res: Response) => {
  const { name, nationalId, seatNumber, classId, avatarSeed, parentName, parentPhone, guardianPhone, healthNote, academicNote } = req.body;
  const id = 'st-' + Date.now();

  db.prepare(`
    INSERT INTO students (id, name, national_id, seat_number, class_id, avatar_seed, parent_name, parent_phone, guardian_phone, consecutive_absences, health_note, academic_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `).run(
    id,
    name,
    nationalId || null,
    seatNumber || 1,
    classId,
    avatarSeed || name.split(' ')[0],
    parentName || 'ولي الأمر',
    parentPhone || '0500000000',
    guardianPhone || null,
    healthNote || null,
    academicNote || null
  );

  // Update class student count
  db.prepare('UPDATE classes SET student_count = student_count + 1 WHERE id = ?').run(classId);

  const newRow = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.json(formatStudent(newRow));
});

app.post('/api/students/bulk', (req: Request, res: Response) => {
  const { classId, students: studentList } = req.body;
  if (!classId || !Array.isArray(studentList)) {
    res.status(400).json({ error: 'بيانات غير كافية لإدراج الطلاب.' });
    return;
  }

  const insertStudent = db.prepare(`
    INSERT INTO students (id, name, national_id, seat_number, class_id, avatar_seed, parent_name, parent_phone, guardian_phone, consecutive_absences, health_note, academic_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
  `);

  const insertedIds: string[] = [];

  const transaction = db.transaction((list: any[]) => {
    let seat = 1;
    for (const st of list) {
      const id = 'st-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      insertStudent.run(
        id,
        st.name,
        st.nationalId || null,
        st.seatNumber || seat++,
        classId,
        st.avatarSeed || st.name.split(' ')[0],
        st.parentName || 'ولي الأمر',
        st.parentPhone || '0500000000',
        st.guardianPhone || null,
        st.healthNote || null,
        st.academicNote || null
      );
      insertedIds.push(id);
    }
    const totalInClass = (db.prepare('SELECT COUNT(*) as count FROM students WHERE class_id = ?').get(classId) as any).count;
    db.prepare('UPDATE classes SET student_count = ? WHERE id = ?').run(totalInClass, classId);
  });

  transaction(studentList);
  res.json({ success: true, count: insertedIds.length });
});

app.put('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الطالب غير موجود' });
    return;
  }

  const { name, nationalId, seatNumber, classId, avatarSeed, parentName, parentPhone, guardianPhone, consecutiveAbsences, healthNote, academicNote } = req.body;

  db.prepare(`
    UPDATE students
    SET name = ?, national_id = ?, seat_number = ?, class_id = ?, avatar_seed = ?, parent_name = ?, parent_phone = ?, guardian_phone = ?, consecutive_absences = ?, health_note = ?, academic_note = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    nationalId !== undefined ? nationalId : existing.national_id,
    seatNumber !== undefined ? seatNumber : existing.seat_number,
    classId !== undefined ? classId : existing.class_id,
    avatarSeed !== undefined ? avatarSeed : existing.avatar_seed,
    parentName !== undefined ? parentName : existing.parent_name,
    parentPhone !== undefined ? parentPhone : existing.parent_phone,
    guardianPhone !== undefined ? guardianPhone : existing.guardian_phone,
    consecutiveAbsences !== undefined ? consecutiveAbsences : existing.consecutive_absences,
    healthNote !== undefined ? healthNote : existing.health_note,
    academicNote !== undefined ? academicNote : existing.academic_note,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.json(formatStudent(updatedRow));
});

app.delete('/api/students/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT class_id FROM students WHERE id = ?').get(id) as any;
  if (existing) {
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    db.prepare('UPDATE classes SET student_count = MAX(0, student_count - 1) WHERE id = ?').run(existing.class_id);
  }
  res.json({ success: true, id });
});

app.post('/api/students/extract-names', (req: Request, res: Response) => {
  const { text } = req.body;
  if (!text) {
    res.status(400).json({ names: [] });
    return;
  }
  const lines = text
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 2 && !l.includes('اسم') && !l.includes('الصف'));
  res.json({ names: lines });
});

// ==========================================
// 5. ATTENDANCE OPERATIONS (`/api/attendance`)
// ==========================================

app.get('/api/attendance', (req: Request, res: Response) => {
  const { classId, date, period } = req.query;
  if (!classId || !date || !period) {
    res.status(400).json({ error: 'تتطلب العملية تحديد classId و date و period' });
    return;
  }

  const session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, Number(period)) as any;

  if (!session) {
    res.json({
      session: null,
      records: {},
    });
    return;
  }

  const recRows = db.prepare('SELECT * FROM attendance_records WHERE session_id = ?').all(session.id) as any[];
  const records: Record<string, any> = {};
  recRows.forEach(r => {
    records[r.student_id] = {
      studentId: r.student_id,
      status: r.status,
      note: r.note || undefined,
      excuseId: r.excuse_id || undefined,
      updatedAt: r.updated_at,
    };
  });

  res.json({
    session: {
      id: session.id,
      classId: session.class_id,
      period: session.period_number,
      date: session.date,
      isSubmitted: Boolean(session.is_submitted),
      submittedAt: session.submitted_at || undefined,
      submittedBy: session.submitted_by_user_id || undefined,
      submittedTeacherName: session.submitted_teacher_name || undefined,
    },
    records,
  });
});

app.post('/api/attendance/record', (req: Request, res: Response) => {
  const { classId, date, period, studentId, status, note } = req.body;
  if (!classId || !date || !period || !studentId || !status) {
    res.status(400).json({ error: 'بيانات غير كافية لتسجيل الحضور' });
    return;
  }

  let session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, Number(period)) as any;

  if (!session) {
    const sessionId = `session-${classId}-${date}-${period}`;
    db.prepare(`
      INSERT INTO attendance_sessions (id, class_id, period_number, date, is_submitted)
      VALUES (?, ?, ?, ?, 0)
    `).run(sessionId, classId, Number(period), date);
    session = { id: sessionId };
  }

  const recId = `rec-${session.id}-${studentId}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO attendance_records (id, session_id, student_id, status, note, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id, student_id) DO UPDATE SET
      status = excluded.status,
      note = excluded.note,
      updated_at = excluded.updated_at
  `).run(recId, session.id, studentId, status, note || null, now);

  res.json({ success: true, studentId, status, note, updatedAt: now });
});

app.post('/api/attendance/submit', (req: Request, res: Response) => {
  const { classId, date, period, submittedBy, submittedTeacherName, records } = req.body;
  if (!classId || !date || !period) {
    res.status(400).json({ error: 'بيانات الاعتماد غير كاملة.' });
    return;
  }

  let session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, Number(period)) as any;

  const sessionId = session ? session.id : `session-${classId}-${date}-${period}`;
  const submittedAt = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  if (!session) {
    db.prepare(`
      INSERT INTO attendance_sessions (id, class_id, period_number, date, is_submitted, submitted_at, submitted_by_user_id, submitted_teacher_name)
      VALUES (?, ?, ?, ?, 1, ?, ?, ?)
    `).run(sessionId, classId, Number(period), date, submittedAt, submittedBy || null, submittedTeacherName || 'المعلم');
  } else {
    db.prepare(`
      UPDATE attendance_sessions
      SET is_submitted = 1, submitted_at = ?, submitted_by_user_id = ?, submitted_teacher_name = ?
      WHERE id = ?
    `).run(submittedAt, submittedBy || null, submittedTeacherName || 'المعلم', sessionId);
  }

  // Save/Update records if provided
  if (records && typeof records === 'object') {
    const insertRec = db.prepare(`
      INSERT INTO attendance_records (id, session_id, student_id, status, note, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id, student_id) DO UPDATE SET
        status = excluded.status,
        note = excluded.note,
        updated_at = excluded.updated_at
    `);

    const now = new Date().toISOString();
    for (const [stId, rec] of Object.entries(records as Record<string, any>)) {
      insertRec.run(`rec-${sessionId}-${stId}`, sessionId, stId, rec.status || 'present', rec.note || null, now);
    }
  }

  res.json({
    success: true,
    sessionId,
    submittedAt,
  });
});

app.post('/api/attendance/reset', (req: Request, res: Response) => {
  const { classId, date, period } = req.body;
  const session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, Number(period)) as any;

  if (session) {
    db.prepare('DELETE FROM attendance_records WHERE session_id = ?').run(session.id);
    db.prepare('UPDATE attendance_sessions SET is_submitted = 0, submitted_at = null WHERE id = ?').run(session.id);
  }

  res.json({ success: true });
});

app.post('/api/attendance/reopen', (req: Request, res: Response) => {
  const { classId, date, period } = req.body;
  db.prepare(`
    UPDATE attendance_sessions
    SET is_submitted = 0
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).run(classId, date, Number(period));

  res.json({ success: true });
});

app.get('/api/attendance/stats', (req: Request, res: Response) => {
  const { date } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  const totalStudents = (db.prepare('SELECT COUNT(*) as count FROM students').get() as any).count;
  const totalClasses = (db.prepare('SELECT COUNT(*) as count FROM classes').get() as any).count;

  const records = db.prepare(`
    SELECT r.status, COUNT(*) as count
    FROM attendance_records r
    JOIN attendance_sessions s ON r.session_id = s.id
    WHERE s.date = ?
    GROUP BY r.status
  `).all(targetDate) as any[];

  let totalPresent = 0;
  let totalAbsent = 0;
  let totalLate = 0;
  let totalExcused = 0;

  records.forEach(r => {
    if (r.status === 'present') totalPresent = r.count;
    if (r.status === 'absent') totalAbsent = r.count;
    if (r.status === 'late') totalLate = r.count;
    if (r.status === 'excused') totalExcused = r.count;
  });

  const submittedSessionsCount = (db.prepare(`
    SELECT COUNT(DISTINCT class_id) as count FROM attendance_sessions
    WHERE date = ? AND is_submitted = 1
  `).get(targetDate) as any).count;

  const pendingClassesCount = Math.max(0, totalClasses - submittedSessionsCount);
  const attendanceRate = totalStudents > 0 ? Math.round(((totalPresent + totalLate) / totalStudents) * 100) : 100;

  res.json({
    totalStudents,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    attendanceRate,
    pendingClassesCount,
  });
});

// ==========================================
// 6. MEDICAL EXCUSES ENDPOINTS (`/api/excuses`)
// ==========================================

app.get('/api/excuses', (req: Request, res: Response) => {
  const { studentId, date } = req.query;
  let rows;
  if (studentId && date) {
    rows = db.prepare('SELECT * FROM medical_excuses WHERE student_id = ? AND date = ?').all(studentId, date);
  } else if (studentId) {
    rows = db.prepare('SELECT * FROM medical_excuses WHERE student_id = ? ORDER BY date DESC').all(studentId);
  } else {
    rows = db.prepare('SELECT * FROM medical_excuses ORDER BY date DESC').all();
  }

  res.json(rows.map((r: any) => ({
    id: r.id,
    studentId: r.student_id,
    date: r.date,
    imageUrl: r.image_url,
    fileName: r.file_name || undefined,
    uploadedAt: r.uploaded_at,
    uploadedBy: r.uploaded_by || undefined,
  })));
});

app.post('/api/excuses', (req: Request, res: Response) => {
  const { studentId, date, imageUrl, fileName, uploadedBy } = req.body;
  if (!studentId || !date || !imageUrl) {
    res.status(400).json({ error: 'يرجى تقديم بيانات العذر الطبي بالكامل.' });
    return;
  }

  const id = 'excuse-' + Date.now();
  const uploadedAt = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  // Delete existing excuse for same student & date
  db.prepare('DELETE FROM medical_excuses WHERE student_id = ? AND date = ?').run(studentId, date);

  db.prepare(`
    INSERT INTO medical_excuses (id, student_id, date, image_url, file_name, uploaded_at, uploaded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, studentId, date, imageUrl, fileName || null, uploadedAt, uploadedBy || 'المعلم');

  res.json({
    id,
    studentId,
    date,
    imageUrl,
    fileName,
    uploadedAt,
    uploadedBy,
  });
});

app.delete('/api/excuses/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM medical_excuses WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// ==========================================
// 7. TIMETABLE & PERIODS ENDPOINTS
// ==========================================

app.get('/api/timetable', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM timetable_slots').all();
  res.json(rows.map(formatTimetable));
});

app.post('/api/timetable', (req: Request, res: Response) => {
  const { day, periodNumber, timeRange, subject, classId, className, room, teacherId, teacherName, substituteTeacherId, substituteTeacherName } = req.body;
  const id = 'tt-' + Date.now();

  db.prepare(`
    INSERT INTO timetable_slots (id, day, period_number, time_range, subject, class_id, class_name, room, teacher_id, teacher_name, substitute_teacher_id, substitute_teacher_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    day,
    periodNumber,
    timeRange || null,
    subject,
    classId,
    className || null,
    room || null,
    teacherId || null,
    teacherName || null,
    substituteTeacherId || null,
    substituteTeacherName || null
  );

  const newRow = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id);
  res.json(formatTimetable(newRow));
});

app.put('/api/timetable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الحصة غير موجودة' });
    return;
  }

  const { day, periodNumber, timeRange, subject, classId, className, room, teacherId, teacherName, substituteTeacherId, substituteTeacherName } = req.body;

  db.prepare(`
    UPDATE timetable_slots
    SET day = ?, period_number = ?, time_range = ?, subject = ?, class_id = ?, class_name = ?, room = ?, teacher_id = ?, teacher_name = ?, substitute_teacher_id = ?, substitute_teacher_name = ?
    WHERE id = ?
  `).run(
    day !== undefined ? day : existing.day,
    periodNumber !== undefined ? periodNumber : existing.period_number,
    timeRange !== undefined ? timeRange : existing.time_range,
    subject !== undefined ? subject : existing.subject,
    classId !== undefined ? classId : existing.class_id,
    className !== undefined ? className : existing.class_name,
    room !== undefined ? room : existing.room,
    teacherId !== undefined ? teacherId : existing.teacher_id,
    teacherName !== undefined ? teacherName : existing.teacher_name,
    substituteTeacherId !== undefined ? substituteTeacherId : existing.substitute_teacher_id,
    substituteTeacherName !== undefined ? substituteTeacherName : existing.substitute_teacher_name,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id);
  res.json(formatTimetable(updatedRow));
});

app.delete('/api/timetable/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM timetable_slots WHERE id = ?').run(id);
  res.json({ success: true, id });
});

app.get('/api/periods', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM period_timings ORDER BY period_number ASC').all();
  res.json(rows.map((r: any) => ({
    periodNumber: r.period_number,
    name: r.name,
    startTime: r.start_time,
    endTime: r.end_time,
    attendanceAllowedFrom: r.attendance_allowed_from,
    attendanceAllowedUntil: r.attendance_allowed_until,
    windowMinutes: r.window_minutes,
  })));
});

app.put('/api/periods/:periodNumber', (req: Request, res: Response) => {
  const { periodNumber } = req.params;
  const pNum = Number(periodNumber);
  const existing = db.prepare('SELECT * FROM period_timings WHERE period_number = ?').get(pNum) as any;
  if (!existing) {
    res.status(404).json({ error: 'الحصة غير موجودة' });
    return;
  }

  const { name, startTime, endTime, attendanceAllowedFrom, attendanceAllowedUntil, windowMinutes } = req.body;

  db.prepare(`
    UPDATE period_timings
    SET name = ?, start_time = ?, end_time = ?, attendance_allowed_from = ?, attendance_allowed_until = ?, window_minutes = ?
    WHERE period_number = ?
  `).run(
    name !== undefined ? name : existing.name,
    startTime !== undefined ? startTime : existing.start_time,
    endTime !== undefined ? endTime : existing.end_time,
    attendanceAllowedFrom !== undefined ? attendanceAllowedFrom : existing.attendance_allowed_from,
    attendanceAllowedUntil !== undefined ? attendanceAllowedUntil : existing.attendance_allowed_until,
    windowMinutes !== undefined ? windowMinutes : existing.window_minutes,
    pNum
  );

  const updatedRow = db.prepare('SELECT * FROM period_timings WHERE period_number = ?').get(pNum) as any;
  res.json({
    periodNumber: updatedRow.period_number,
    name: updatedRow.name,
    startTime: updatedRow.start_time,
    endTime: updatedRow.end_time,
    attendanceAllowedFrom: updatedRow.attendance_allowed_from,
    attendanceAllowedUntil: updatedRow.attendance_allowed_until,
    windowMinutes: updatedRow.window_minutes,
  });
});

// ==========================================
// 8. SETTINGS & LOCKDOWN ENDPOINTS
// ==========================================

app.get('/api/settings', (req: Request, res: Response) => {
  const row = db.prepare('SELECT * FROM system_settings WHERE id = "settings"').get() as any;
  if (!row) {
    res.json({});
    return;
  }
  res.json({
    schoolName: row.school_name,
    editingDeadline: row.editing_deadline,
    editingDeadlineEnabled: Boolean(row.editing_deadline_enabled),
    emergencyLockdown: Boolean(row.emergency_lockdown),
    lockdownTime: row.lockdown_time || undefined,
    enableSmsAlerts: Boolean(row.enable_sms_alerts),
    pauseAlertsOnHolidays: Boolean(row.pause_alerts_on_holidays),
    defaultAllPresent: Boolean(row.default_all_present),
    allowOfflineMode: Boolean(row.allow_offline_mode),
    enablePushNotifications: Boolean(row.enable_push_notifications),
    requireExcuseImage: Boolean(row.require_excuse_image),
  });
});

app.put('/api/settings', (req: Request, res: Response) => {
  const updates = req.body;
  const existing = db.prepare('SELECT * FROM system_settings WHERE id = "settings"').get() as any;

  db.prepare(`
    UPDATE system_settings
    SET school_name = ?, editing_deadline = ?, editing_deadline_enabled = ?, emergency_lockdown = ?, lockdown_time = ?, enable_sms_alerts = ?, pause_alerts_on_holidays = ?, default_all_present = ?, allow_offline_mode = ?, enable_push_notifications = ?, require_excuse_image = ?
    WHERE id = "settings"
  `).run(
    updates.schoolName !== undefined ? updates.schoolName : existing.school_name,
    updates.editingDeadline !== undefined ? updates.editingDeadline : existing.editing_deadline,
    updates.editingDeadlineEnabled !== undefined ? (updates.editingDeadlineEnabled ? 1 : 0) : existing.editing_deadline_enabled,
    updates.emergencyLockdown !== undefined ? (updates.emergencyLockdown ? 1 : 0) : existing.emergency_lockdown,
    updates.lockdownTime !== undefined ? updates.lockdownTime : existing.lockdown_time,
    updates.enableSmsAlerts !== undefined ? (updates.enableSmsAlerts ? 1 : 0) : existing.enable_sms_alerts,
    updates.pauseAlertsOnHolidays !== undefined ? (updates.pauseAlertsOnHolidays ? 1 : 0) : existing.pause_alerts_on_holidays,
    updates.defaultAllPresent !== undefined ? (updates.defaultAllPresent ? 1 : 0) : existing.default_all_present,
    updates.allowOfflineMode !== undefined ? (updates.allowOfflineMode ? 1 : 0) : existing.allow_offline_mode,
    updates.enablePushNotifications !== undefined ? (updates.enablePushNotifications ? 1 : 0) : existing.enable_push_notifications,
    updates.requireExcuseImage !== undefined ? (updates.requireExcuseImage ? 1 : 0) : existing.require_excuse_image
  );

  const updated = db.prepare('SELECT * FROM system_settings WHERE id = "settings"').get() as any;
  res.json({
    schoolName: updated.school_name,
    editingDeadline: updated.editing_deadline,
    editingDeadlineEnabled: Boolean(updated.editing_deadline_enabled),
    emergencyLockdown: Boolean(updated.emergency_lockdown),
    lockdownTime: updated.lockdown_time || undefined,
    enableSmsAlerts: Boolean(updated.enable_sms_alerts),
    pauseAlertsOnHolidays: Boolean(updated.pause_alerts_on_holidays),
    defaultAllPresent: Boolean(updated.default_all_present),
    allowOfflineMode: Boolean(updated.allow_offline_mode),
    enablePushNotifications: Boolean(updated.enable_push_notifications),
    requireExcuseImage: Boolean(updated.require_excuse_image),
  });
});

app.post('/api/settings/lockdown', (req: Request, res: Response) => {
  const { emergencyLockdown, reason } = req.body;
  const lockdownTime = emergencyLockdown ? new Date().toLocaleTimeString('ar-SA') : null;

  db.prepare(`
    UPDATE system_settings
    SET emergency_lockdown = ?, lockdown_time = ?
    WHERE id = "settings"
  `).run(emergencyLockdown ? 1 : 0, lockdownTime);

  // Broadcast Notification
  const notifId = 'notif-' + Date.now();
  const title = emergencyLockdown ? 'إغلاق طوارئ للنظام' : 'إلغاء إغلاق الطوارئ';
  const message = emergencyLockdown
    ? `تم تفعيل حظر التعديل الطارئ: ${reason || 'إجراء احترازي إداري لمنع تعديل سجلات الحضور'}`
    : 'تم رفع حظر الطوارئ وإتاحة تسجيل الحضور لجميع المعلمين.';
  const type = emergencyLockdown ? 'warning' : 'info';

  db.prepare(`
    INSERT INTO notifications (id, title, message, time, type, read)
    VALUES (?, ?, ?, 'الآن', ?, 0)
  `).run(notifId, title, message, type);

  res.json({
    emergencyLockdown,
    lockdownTime,
  });
});

// ==========================================
// 9. NOTIFICATIONS & SMS ENDPOINTS
// ==========================================

app.get('/api/notifications', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM notifications ORDER BY id DESC').all();
  res.json(rows.map((r: any) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    time: r.time,
    type: r.type,
    classId: r.class_id || undefined,
    read: Boolean(r.read),
  })));
});

app.post('/api/notifications', (req: Request, res: Response) => {
  const { title, message, type, classId } = req.body;
  const id = 'notif-' + Date.now();

  db.prepare(`
    INSERT INTO notifications (id, title, message, time, type, class_id, read)
    VALUES (?, ?, ?, 'الآن', ?, ?, 0)
  `).run(id, title, message, type || 'reminder', classId || null);

  const newRow = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as any;
  res.json({
    id: newRow.id,
    title: newRow.title,
    message: newRow.message,
    time: newRow.time,
    type: newRow.type,
    classId: newRow.class_id || undefined,
    read: Boolean(newRow.read),
  });
});

app.delete('/api/notifications/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  res.json({ success: true, id });
});

app.delete('/api/notifications', (req: Request, res: Response) => {
  db.prepare('DELETE FROM notifications').run();
  res.json({ success: true });
});

app.post('/api/notifications/sms', (req: Request, res: Response) => {
  const { studentId, message, parentPhone } = req.body;
  res.json({
    success: true,
    message: `تم إرسال الرسالة النصية بنجاح إلى الرقم ${parentPhone || 'المسجل'}.`,
    timestamp: new Date().toISOString(),
  });
});

// Serve Vite production build static assets if dist folder exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');

app.use(express.static(distPath));

app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Endpoint not found' });
    return;
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.send('School Attendance Backend API Server Running');
    }
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Backend server listening on http://localhost:${PORT}`);
});
