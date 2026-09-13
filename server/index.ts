import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db, { initDb } from './db';
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

function requireManager(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'يرجى تسجيل الدخول للوصول لهذا المورد.' });
    return;
  }
  if (req.user.role !== 'manager') {
    res.status(403).json({ error: 'هذا الإجراء يتطلب صلاحيات مدير النظام.' });
    return;
  }
  next();
}

app.use(authenticateToken);

// ==========================================
// A. HEALTH & SYSTEM ENDPOINTS
// ==========================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    mode: 'serverless-compatible',
    timestamp: new Date().toISOString(),
  });
});

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
    grade: row.grade || row.grade_level || '',
    gradeLevel: row.grade_level || row.grade || '',
    section: row.section || 'أ',
    room: row.room || row.room_number || '',
    roomNumber: row.room_number || row.room || '',
    homeroomTeacher: row.homeroom_teacher || '',
    studentCount: row.student_count || 0,
    orderIndex: row.order_index || 0,
  };
}

// Helper to format Student DB row
function formatStudent(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    classId: row.class_id,
    fullName: row.full_name || row.name,
    name: row.name || row.full_name,
    rollNumber: row.roll_number || row.seat_number || 1,
    seatNumber: row.seat_number || row.roll_number || 1,
    nationalId: row.national_id || undefined,
    parentPhone: row.parent_phone || '',
    parentWhatsapp: row.parent_whatsapp || row.parent_phone || '',
    emergencyPhone: row.emergency_phone || row.guardian_phone || row.parent_phone || '',
    medicalNotes: row.medical_notes || row.health_note || undefined,
    healthNote: row.health_note || row.medical_notes || undefined,
    academicNote: row.academic_note || undefined,
    isActive: Boolean(row.is_active ?? 1),
    orderIndex: row.order_index || 0,
    avatarSeed: row.avatar_seed || (row.name ? row.name.split(' ')[0] : 'st'),
    parentName: row.parent_name || 'ولي الأمر',
    guardianPhone: row.guardian_phone || undefined,
    consecutiveAbsences: row.consecutive_absences || 0,
  };
}

// Helper to format Staff DB row
function formatStaff(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    email: row.email || `${row.id}@school.edu`,
    subjectOrDept: row.subject_or_dept || row.subject || '',
    subject: row.subject || row.subject_or_dept || '',
    phone: row.phone,
    status: row.status,
    assignedClasses: row.assigned_classes ? JSON.parse(row.assigned_classes) : [],
  };
}

// Helper to format Timetable DB row
function formatTimetable(row: any) {
  if (!row) return null;
  const daysArr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return {
    id: row.id,
    dayOfWeek: row.day_of_week ?? 0,
    day: row.day || daysArr[row.day_of_week] || 'الأحد',
    periodNumber: row.period_number,
    timeRange: row.time_range || '',
    subject: row.subject,
    classId: row.class_id,
    className: row.class_name || '',
    room: row.room || row.room_number || '',
    roomNumber: row.room_number || row.room || '',
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

  const pwdToCompare = row?.password || row?.password_hash;
  if (!row || !pwdToCompare || !bcrypt.compareSync(password.trim(), pwdToCompare)) {
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
    INSERT INTO users (id, username, password, password_hash, name, role, teacher_id, subject, phone, assigned_classes, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    username.trim(),
    hashedPassword,
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

app.get('/api/users', requireAuth, (req: AuthRequest, res: Response) => {
  const rows = db.prepare('SELECT * FROM users').all();
  res.json(rows.map(formatUser));
});

app.post('/api/users', requireManager, (req: AuthRequest, res: Response) => {
  const { username, password, name, role, teacherId, subject, phone, assignedClasses, permissions } = req.body;
  if (!username || !name) {
    res.status(400).json({ error: 'يرجى إدخال اسم المستخدم والاسم الكامل.' });
    return;
  }

  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(username.trim().toLowerCase());
  if (existing) {
    res.status(400).json({ error: 'اسم المستخدم مسجل مسبقاً.' });
    return;
  }

  const id = 'user-' + Date.now();
  const hashedPassword = bcrypt.hashSync(password || '123', 10);

  db.prepare(`
    INSERT INTO users (id, username, password, password_hash, name, role, teacher_id, subject, phone, assigned_classes, permissions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    username.trim(),
    hashedPassword,
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

app.put('/api/users/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (req.user.role !== 'manager' && req.user.id !== id) {
    res.status(403).json({ error: 'غير مصرح لك بتعديل بيانات هذا المستخدم.' });
    return;
  }

  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  const { username, password, name, role, teacherId, subject, phone, assignedClasses, permissions } = req.body;

  let hashedPassword = existing.password || existing.password_hash;
  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }

  db.prepare(`
    UPDATE users
    SET username = ?, password = ?, password_hash = ?, name = ?, role = ?, teacher_id = ?, subject = ?, phone = ?, assigned_classes = ?, permissions = ?
    WHERE id = ?
  `).run(
    username !== undefined ? username.trim() : existing.username,
    hashedPassword,
    hashedPassword,
    name !== undefined ? name : existing.name,
    role !== undefined && req.user.role === 'manager' ? role : existing.role,
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

app.delete('/api/users/:id', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const targetUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!targetUser) {
    res.status(404).json({ error: 'المستخدم غير موجود' });
    return;
  }

  if (targetUser.role === 'manager') {
    const managerCount = (db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'manager'").get() as any).count;
    if (managerCount <= 1) {
      res.status(400).json({ error: 'لا يمكن حذف حساب المدير الوحيد في النظام.' });
      return;
    }
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true, id });
});

app.get('/api/staff', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM staff').all();
  res.json(rows.map(formatStaff));
});

app.put('/api/staff/:id/role', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { role, status, assignedClasses } = req.body;
  const existing = db.prepare('SELECT * FROM staff WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'عضو الكادر غير موجود' });
    return;
  }

  db.prepare(`
    UPDATE staff
    SET role = ?, status = ?, assigned_classes = ?
    WHERE id = ?
  `).run(
    role || existing.role,
    status || existing.status,
    assignedClasses !== undefined ? JSON.stringify(assignedClasses) : existing.assigned_classes,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
  res.json(formatStaff(updatedRow));
});

// ==========================================
// 3. CLASSES ENDPOINTS (`/api/classes`)
// ==========================================

app.get('/api/classes', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM classes ORDER BY order_index ASC, name ASC').all();
  res.json(rows.map(formatClass));
});

app.post('/api/classes', requireManager, (req: AuthRequest, res: Response) => {
  const { id: reqId, name, grade, gradeLevel, section, room, roomNumber, homeroomTeacher, studentCount, orderIndex } = req.body;
  if (!name) {
    res.status(400).json({ error: 'اسم الفصل مطلوب.' });
    return;
  }

  const id = reqId || 'class-' + Date.now();
  const g = gradeLevel || grade || 'التاسع';
  const rm = roomNumber || room || '101';
  const sec = section || 'أ';
  const teacher = homeroomTeacher || 'غير محدد';
  const count = studentCount || 0;
  const idx = orderIndex || 0;

  db.prepare(`
    INSERT INTO classes (id, name, grade, grade_level, section, room_number, room, homeroom_teacher, student_count, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, g, g, sec, rm, rm, teacher, count, idx);

  const newRow = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
  res.json(formatClass(newRow));
});

app.put('/api/classes/:id', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الفصل غير موجود' });
    return;
  }

  const { name, grade, gradeLevel, section, room, roomNumber, homeroomTeacher, studentCount, orderIndex } = req.body;

  const g = gradeLevel !== undefined ? gradeLevel : (grade !== undefined ? grade : existing.grade_level);
  const rm = roomNumber !== undefined ? roomNumber : (room !== undefined ? room : existing.room_number);

  db.prepare(`
    UPDATE classes
    SET name = ?, grade = ?, grade_level = ?, section = ?, room_number = ?, room = ?, homeroom_teacher = ?, student_count = ?, order_index = ?
    WHERE id = ?
  `).run(
    name !== undefined ? name : existing.name,
    g,
    g,
    section !== undefined ? section : existing.section,
    rm,
    rm,
    homeroomTeacher !== undefined ? homeroomTeacher : existing.homeroom_teacher,
    studentCount !== undefined ? studentCount : existing.student_count,
    orderIndex !== undefined ? orderIndex : existing.order_index,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM classes WHERE id = ?').get(id);
  res.json(formatClass(updatedRow));
});

app.delete('/api/classes/:id', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  db.transaction(() => {
    db.prepare('DELETE FROM students WHERE class_id = ?').run(id);
    db.prepare('DELETE FROM timetable_slots WHERE class_id = ?').run(id);
    db.prepare('DELETE FROM attendance_sessions WHERE class_id = ?').run(id);
    db.prepare('DELETE FROM classes WHERE id = ?').run(id);
  })();

  res.json({ success: true, id });
});

// ==========================================
// 4. STUDENTS ENDPOINTS (`/api/students`)
// ==========================================

app.get('/api/students', (req: Request, res: Response) => {
  const { classId } = req.query;
  let rows;
  if (classId) {
    rows = db.prepare('SELECT * FROM students WHERE class_id = ? ORDER BY seat_number ASC, roll_number ASC, order_index ASC').all(classId);
  } else {
    rows = db.prepare('SELECT * FROM students ORDER BY class_id ASC, seat_number ASC, roll_number ASC').all();
  }
  res.json(rows.map(formatStudent));
});

app.post('/api/students', requireAuth, (req: AuthRequest, res: Response) => {
  const {
    classId,
    fullName,
    name,
    rollNumber,
    seatNumber,
    nationalId,
    parentPhone,
    parentWhatsapp,
    emergencyPhone,
    medicalNotes,
    healthNote,
    academicNote,
    parentName,
    guardianPhone,
    avatarSeed,
  } = req.body;

  if (!classId) {
    res.status(400).json({ error: 'معرف الفصل (classId) مطلوب.' });
    return;
  }

  const stName = fullName || name || 'طالب جديد';
  const seat = seatNumber || rollNumber || 1;
  const pPhone = parentPhone || '0500000000';
  const pWhatsapp = parentWhatsapp || pPhone;
  const ePhone = emergencyPhone || guardianPhone || pPhone;
  const medNotes = medicalNotes || healthNote || null;
  const id = 'st-' + Date.now();

  db.prepare(`
    INSERT INTO students (
      id, class_id, full_name, name, roll_number, seat_number, national_id,
      parent_phone, parent_whatsapp, emergency_phone, medical_notes, health_note, academic_note,
      is_active, order_index, avatar_seed, parent_name, guardian_phone, consecutive_absences
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 0)
  `).run(
    id,
    classId,
    stName,
    stName,
    seat,
    seat,
    nationalId || null,
    pPhone,
    pWhatsapp,
    ePhone,
    medNotes,
    medNotes,
    academicNote || null,
    seat,
    avatarSeed || stName.split(' ')[0],
    parentName || 'ولي الأمر',
    guardianPhone || null
  );

  // Update class student count
  db.prepare('UPDATE classes SET student_count = (SELECT COUNT(*) FROM students WHERE class_id = ?) WHERE id = ?').run(classId, classId);

  const newRow = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.json(formatStudent(newRow));
});

app.post('/api/students/bulk', requireAuth, (req: AuthRequest, res: Response) => {
  const { classId, students: studentList } = req.body;
  if (!classId || !Array.isArray(studentList)) {
    res.status(400).json({ error: 'بيانات غير كافية لإدراج الطلاب.' });
    return;
  }

  const insertStudent = db.prepare(`
    INSERT INTO students (
      id, class_id, full_name, name, roll_number, seat_number, national_id,
      parent_phone, parent_whatsapp, emergency_phone, medical_notes, health_note, academic_note,
      is_active, order_index, avatar_seed, parent_name, guardian_phone, consecutive_absences
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 0)
  `);

  const insertedIds: string[] = [];

  const transaction = db.transaction((list: any[]) => {
    let seat = 1;
    for (const st of list) {
      const id = st.id || ('st-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
      const stName = st.fullName || st.name || 'طالب';
      const stSeat = st.seatNumber || st.rollNumber || seat++;
      const pPhone = st.parentPhone || '0500000000';
      const pWhatsapp = st.parentWhatsapp || pPhone;
      const ePhone = st.emergencyPhone || st.guardianPhone || pPhone;
      const medNotes = st.medicalNotes || st.healthNote || null;

      insertStudent.run(
        id,
        classId,
        stName,
        stName,
        stSeat,
        stSeat,
        st.nationalId || null,
        pPhone,
        pWhatsapp,
        ePhone,
        medNotes,
        medNotes,
        st.academicNote || null,
        stSeat,
        st.avatarSeed || stName.split(' ')[0],
        st.parentName || 'ولي الأمر',
        st.guardianPhone || null
      );
      insertedIds.push(id);
    }
    const totalInClass = (db.prepare('SELECT COUNT(*) as count FROM students WHERE class_id = ?').get(classId) as any).count;
    db.prepare('UPDATE classes SET student_count = ? WHERE id = ?').run(totalInClass, classId);
  });

  transaction(studentList);
  res.json({ success: true, count: insertedIds.length });
});

app.put('/api/students/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الطالب غير موجود' });
    return;
  }

  const {
    fullName,
    name,
    rollNumber,
    seatNumber,
    classId,
    nationalId,
    parentPhone,
    parentWhatsapp,
    emergencyPhone,
    medicalNotes,
    healthNote,
    academicNote,
    isActive,
    avatarSeed,
    parentName,
    guardianPhone,
    consecutiveAbsences,
  } = req.body;

  const stName = fullName !== undefined ? fullName : (name !== undefined ? name : existing.name);
  const stSeat = seatNumber !== undefined ? seatNumber : (rollNumber !== undefined ? rollNumber : existing.seat_number);
  const medNotes = medicalNotes !== undefined ? medicalNotes : (healthNote !== undefined ? healthNote : existing.health_note);

  db.prepare(`
    UPDATE students
    SET full_name = ?, name = ?, roll_number = ?, seat_number = ?, class_id = ?, national_id = ?,
        parent_phone = ?, parent_whatsapp = ?, emergency_phone = ?, medical_notes = ?, health_note = ?, academic_note = ?,
        is_active = ?, avatar_seed = ?, parent_name = ?, guardian_phone = ?, consecutive_absences = ?
    WHERE id = ?
  `).run(
    stName,
    stName,
    stSeat,
    stSeat,
    classId !== undefined ? classId : existing.class_id,
    nationalId !== undefined ? nationalId : existing.national_id,
    parentPhone !== undefined ? parentPhone : existing.parent_phone,
    parentWhatsapp !== undefined ? parentWhatsapp : existing.parent_whatsapp,
    emergencyPhone !== undefined ? emergencyPhone : existing.emergency_phone,
    medNotes,
    medNotes,
    academicNote !== undefined ? academicNote : existing.academic_note,
    isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
    avatarSeed !== undefined ? avatarSeed : existing.avatar_seed,
    parentName !== undefined ? parentName : existing.parent_name,
    guardianPhone !== undefined ? guardianPhone : existing.guardian_phone,
    consecutiveAbsences !== undefined ? consecutiveAbsences : existing.consecutive_absences,
    id
  );

  if (classId && classId !== existing.class_id) {
    db.prepare('UPDATE classes SET student_count = (SELECT COUNT(*) FROM students WHERE class_id = ?) WHERE id = ?').run(existing.class_id, existing.class_id);
    db.prepare('UPDATE classes SET student_count = (SELECT COUNT(*) FROM students WHERE class_id = ?) WHERE id = ?').run(classId, classId);
  }

  const updatedRow = db.prepare('SELECT * FROM students WHERE id = ?').get(id);
  res.json(formatStudent(updatedRow));
});

app.delete('/api/students/:id', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT class_id FROM students WHERE id = ?').get(id) as any;
  if (existing) {
    db.prepare('DELETE FROM students WHERE id = ?').run(id);
    db.prepare('UPDATE classes SET student_count = (SELECT COUNT(*) FROM students WHERE class_id = ?) WHERE id = ?').run(existing.class_id, existing.class_id);
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

// Helper to check emergency lockdown and editing deadline
function checkAttendanceLockdownAndDeadline(req: AuthRequest, res: Response): boolean {
  const settings = db.prepare("SELECT * FROM system_settings WHERE id = 'settings'").get() as any;
  if (settings && Boolean(settings.emergency_lockdown)) {
    res.status(403).json({ error: '⚠️ النظام في حالة إغلاق طارئ مؤقت يمنع رصد أو تعديل السجلات.' });
    return false;
  }

  if (settings && Boolean(settings.editing_deadline_enabled) && settings.editing_deadline) {
    if (!req.user || req.user.role !== 'manager') {
      const now = new Date();
      const currentHHMM = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (currentHHMM > settings.editing_deadline) {
        res.status(403).json({
          error: `⚠️ تم تجاوز الموعد النهائي المحدد من إدارة المدرسة لتعديل الحضور (${settings.editing_deadline}).`,
        });
        return false;
      }
    }
  }

  return true;
}

// ==========================================
// 5. ATTENDANCE OPERATIONS (`/api/attendance`)
// ==========================================

app.get('/api/attendance', (req: Request, res: Response) => {
  const { classId, date, period, periodNumber } = req.query;
  const pNum = Number(periodNumber || period);
  if (!classId || !date || isNaN(pNum)) {
    res.status(400).json({ error: 'تتطلب العملية تحديد classId و date و period' });
    return;
  }

  const session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, pNum) as any;

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
      periodNumber: session.period_number,
      date: session.date,
      isSubmitted: Boolean(session.is_submitted),
      submittedAt: session.submitted_at || undefined,
      submittedBy: session.submitted_by || session.submitted_by_user_id || undefined,
      submittedTeacherName: session.submitted_teacher_name || undefined,
      total: session.total || 0,
      present: session.present || 0,
      absent: session.absent || 0,
      late: session.late || 0,
      excused: session.excused || 0,
    },
    records,
  });
});

app.get('/api/attendance/sessions', (req: Request, res: Response) => {
  const { date, classId } = req.query;
  let sql = 'SELECT * FROM attendance_sessions WHERE 1=1';
  const params: any[] = [];

  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  }
  if (classId) {
    sql += ' AND class_id = ?';
    params.push(classId);
  }

  sql += ' ORDER BY date DESC, period_number ASC';
  const rows = db.prepare(sql).all(...params) as any[];

  res.json(rows.map(s => ({
    id: s.id,
    classId: s.class_id,
    periodNumber: s.period_number,
    period: s.period_number,
    date: s.date,
    isSubmitted: Boolean(s.is_submitted),
    submittedAt: s.submitted_at || undefined,
    submittedBy: s.submitted_by || s.submitted_by_user_id || undefined,
    submittedTeacherName: s.submitted_teacher_name || undefined,
    total: s.total || 0,
    present: s.present || 0,
    absent: s.absent || 0,
    late: s.late || 0,
    excused: s.excused || 0,
  })));
});

app.post('/api/attendance/record', requireAuth, (req: AuthRequest, res: Response) => {
  if (!checkAttendanceLockdownAndDeadline(req, res)) return;

  const { classId, date, period, periodNumber, studentId, status, note } = req.body;
  const pNum = Number(periodNumber || period);

  if (!classId || !date || isNaN(pNum) || !studentId || !status) {
    res.status(400).json({ error: 'بيانات غير كافية لتسجيل الحضور' });
    return;
  }

  let session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, pNum) as any;

  if (!session) {
    const sessionId = `session-${classId}-${date}-${pNum}`;
    db.prepare(`
      INSERT INTO attendance_sessions (id, class_id, period_number, date, is_submitted)
      VALUES (?, ?, ?, ?, 0)
    `).run(sessionId, classId, pNum, date);
    session = { id: sessionId };
  }

  const recId = `rec-${session.id}-${studentId}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO attendance_records (id, session_id, class_id, student_id, date, period_number, status, note, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id, student_id) DO UPDATE SET
      status = excluded.status,
      note = excluded.note,
      updated_at = excluded.updated_at,
      updated_by = excluded.updated_by
  `).run(recId, session.id, classId, studentId, date, pNum, status, note || null, now, req.user?.id || null);

  res.json({ success: true, studentId, status, note, updatedAt: now });
});

app.post('/api/attendance/submit', requireAuth, (req: AuthRequest, res: Response) => {
  if (!checkAttendanceLockdownAndDeadline(req, res)) return;

  const { classId, date, period, periodNumber, submittedBy, submittedTeacherName, records } = req.body;
  const pNum = Number(periodNumber || period);

  if (!classId || !date || isNaN(pNum)) {
    res.status(400).json({ error: 'بيانات الاعتماد غير كاملة.' });
    return;
  }

  let session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, pNum) as any;

  const sessionId = session ? session.id : `session-${classId}-${date}-${pNum}`;
  const submittedAt = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  const subBy = submittedBy || req.user?.id || 'teacher';
  const subName = submittedTeacherName || req.user?.name || 'المعلم';

  let totalCount = 0;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  db.transaction(() => {
    // Save/Update records if provided
    if (records && typeof records === 'object') {
      const insertRec = db.prepare(`
        INSERT INTO attendance_records (id, session_id, class_id, student_id, date, period_number, status, note, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id, student_id) DO UPDATE SET
          status = excluded.status,
          note = excluded.note,
          updated_at = excluded.updated_at,
          updated_by = excluded.updated_by
      `);

      const now = new Date().toISOString();
      for (const [stId, rec] of Object.entries(records as Record<string, any>)) {
        totalCount++;
        const st = rec.status || 'present';
        if (st === 'present') presentCount++;
        else if (st === 'absent') absentCount++;
        else if (st === 'late') lateCount++;
        else if (st === 'excused') excusedCount++;

        insertRec.run(`rec-${sessionId}-${stId}`, sessionId, classId, stId, date, pNum, st, rec.note || null, now, req.user?.id || null);
      }
    } else {
      const existingRecs = db.prepare('SELECT status FROM attendance_records WHERE session_id = ?').all(sessionId) as any[];
      totalCount = existingRecs.length;
      existingRecs.forEach(r => {
        if (r.status === 'present') presentCount++;
        else if (r.status === 'absent') absentCount++;
        else if (r.status === 'late') lateCount++;
        else if (r.status === 'excused') excusedCount++;
      });
    }

    if (!session) {
      db.prepare(`
        INSERT INTO attendance_sessions (id, class_id, period_number, date, is_submitted, submitted_at, submitted_by, submitted_by_user_id, submitted_teacher_name, total, present, absent, late, excused)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(sessionId, classId, pNum, date, submittedAt, subBy, subBy, subName, totalCount, presentCount, absentCount, lateCount, excusedCount);
    } else {
      db.prepare(`
        UPDATE attendance_sessions
        SET is_submitted = 1, submitted_at = ?, submitted_by = ?, submitted_by_user_id = ?, submitted_teacher_name = ?, total = ?, present = ?, absent = ?, late = ?, excused = ?
        WHERE id = ?
      `).run(submittedAt, subBy, subBy, subName, totalCount, presentCount, absentCount, lateCount, excusedCount, sessionId);
    }
  })();

  res.json({
    success: true,
    sessionId,
    submittedAt,
    total: totalCount,
    present: presentCount,
    absent: absentCount,
    late: lateCount,
    excused: excusedCount,
  });
});

app.post('/api/attendance/reset', requireManager, (req: AuthRequest, res: Response) => {
  if (!checkAttendanceLockdownAndDeadline(req, res)) return;

  const { classId, date, period, periodNumber } = req.body;
  const pNum = Number(periodNumber || period);

  const session = db.prepare(`
    SELECT * FROM attendance_sessions
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).get(classId, date, pNum) as any;

  if (session) {
    db.transaction(() => {
      db.prepare('DELETE FROM attendance_records WHERE session_id = ?').run(session.id);
      db.prepare('UPDATE attendance_sessions SET is_submitted = 0, submitted_at = null, present = 0, absent = 0, late = 0, excused = 0 WHERE id = ?').run(session.id);
    })();
  }

  res.json({ success: true });
});

app.post('/api/attendance/reopen', requireManager, (req: AuthRequest, res: Response) => {
  if (!checkAttendanceLockdownAndDeadline(req, res)) return;

  const { classId, date, period, periodNumber } = req.body;
  const pNum = Number(periodNumber || period);

  db.prepare(`
    UPDATE attendance_sessions
    SET is_submitted = 0
    WHERE class_id = ? AND date = ? AND period_number = ?
  `).run(classId, date, pNum);

  res.json({ success: true });
});

app.get('/api/attendance/stats', (req: Request, res: Response) => {
  const { date, classId } = req.query;
  const targetDate = (date as string) || new Date().toISOString().split('T')[0];

  let studentSql = 'SELECT COUNT(*) as count FROM students WHERE 1=1';
  let classSql = 'SELECT COUNT(*) as count FROM classes WHERE 1=1';
  const studentParams: any[] = [];
  const classParams: any[] = [];

  if (classId) {
    studentSql += ' AND class_id = ?';
    studentParams.push(classId);
    classSql += ' AND id = ?';
    classParams.push(classId);
  }

  const totalStudents = (db.prepare(studentSql).get(...studentParams) as any).count;
  const totalClasses = (db.prepare(classSql).get(...classParams) as any).count;

  let recSql = `
    SELECT r.status, COUNT(*) as count
    FROM attendance_records r
    JOIN attendance_sessions s ON r.session_id = s.id
    WHERE s.date = ?
  `;
  const recParams: any[] = [targetDate];

  if (classId) {
    recSql += ' AND s.class_id = ?';
    recParams.push(classId);
  }
  recSql += ' GROUP BY r.status';

  const records = db.prepare(recSql).all(...recParams) as any[];

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

  let sessionCountSql = 'SELECT COUNT(DISTINCT class_id) as count FROM attendance_sessions WHERE date = ? AND is_submitted = 1';
  const sessionParams: any[] = [targetDate];
  if (classId) {
    sessionCountSql += ' AND class_id = ?';
    sessionParams.push(classId);
  }

  const submittedSessionsCount = (db.prepare(sessionCountSql).get(...sessionParams) as any).count;
  const pendingClassesCount = Math.max(0, totalClasses - submittedSessionsCount);
  const attendanceRate = totalStudents > 0 ? Math.round(((totalPresent + totalLate) / totalStudents) * 100) : 100;

  // Top absent students
  const topAbsentStudents = db.prepare(`
    SELECT s.id, s.full_name as name, s.class_id as classId, COUNT(r.id) as absenceCount
    FROM students s
    JOIN attendance_records r ON s.id = r.student_id
    WHERE r.status = 'absent'
    GROUP BY s.id
    ORDER BY absenceCount DESC
    LIMIT 5
  `).all();

  res.json({
    totalStudents,
    totalPresent,
    totalAbsent,
    totalLate,
    totalExcused,
    attendanceRate,
    pendingClassesCount,
    topAbsentStudents,
  });
});

// ==========================================
// 6. MEDICAL EXCUSES ENDPOINTS (`/api/excuses`)
// ==========================================

app.get('/api/excuses', (req: Request, res: Response) => {
  const { studentId, classId, date } = req.query;
  let sql = 'SELECT * FROM medical_excuses WHERE 1=1';
  const params: any[] = [];

  if (studentId) {
    sql += ' AND student_id = ?';
    params.push(studentId);
  }
  if (classId) {
    sql += ' AND class_id = ?';
    params.push(classId);
  }
  if (date) {
    sql += ' AND date = ?';
    params.push(date);
  }

  sql += ' ORDER BY date DESC, id DESC';
  const rows = db.prepare(sql).all(...params);

  res.json(rows.map((r: any) => ({
    id: r.id,
    studentId: r.student_id,
    classId: r.class_id,
    date: r.date,
    periodNumber: r.period_number,
    reason: r.reason || '',
    excuseType: r.excuse_type || 'medical',
    notes: r.notes || '',
    doctorName: r.doctor_name || '',
    hospitalName: r.hospital_name || '',
    documentUrl: r.document_url || r.image_url || '',
    imageUrl: r.image_url || r.document_url || '',
    fileName: r.file_name || undefined,
    uploadedAt: r.uploaded_at || r.created_at || '',
    createdAt: r.created_at || r.uploaded_at || '',
    uploadedBy: r.uploaded_by || r.created_by || undefined,
    createdBy: r.created_by || r.uploaded_by || undefined,
  })));
});

app.post('/api/excuses', requireAuth, (req: AuthRequest, res: Response) => {
  const {
    studentId,
    classId,
    date,
    periodNumber,
    reason,
    excuseType,
    notes,
    doctorName,
    hospitalName,
    documentUrl,
    imageUrl,
    fileName,
    uploadedBy,
  } = req.body;

  if (!studentId || !date) {
    res.status(400).json({ error: 'يرجى تقديم بيانات العذر الطبي بالكامل.' });
    return;
  }

  const docUrl = documentUrl || imageUrl || '';
  const id = 'excuse-' + Date.now();
  const now = new Date().toISOString();
  const uploadedTime = new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  const byUser = uploadedBy || req.user?.name || 'المعلم';

  db.transaction(() => {
    // Delete existing excuse for same student & date
    db.prepare('DELETE FROM medical_excuses WHERE student_id = ? AND date = ?').run(studentId, date);

    db.prepare(`
      INSERT INTO medical_excuses (
        id, student_id, class_id, date, period_number, reason, excuse_type, notes,
        doctor_name, hospital_name, document_url, image_url, file_name, uploaded_at, created_at, uploaded_by, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      studentId,
      classId || null,
      date,
      periodNumber || null,
      reason || 'عذر طبي',
      excuseType || 'medical',
      notes || null,
      doctorName || null,
      hospitalName || null,
      docUrl,
      docUrl,
      fileName || null,
      uploadedTime,
      now,
      byUser,
      byUser
    );

    // Update attendance record for student to 'excused'
    const sessionRows = db.prepare('SELECT id FROM attendance_sessions WHERE date = ? AND (class_id = ? OR ? IS NULL)').all(date, classId || null, classId || null) as any[];
    for (const sess of sessionRows) {
      db.prepare(`
        INSERT INTO attendance_records (id, session_id, class_id, student_id, date, period_number, status, note, excuse_id, updated_at, updated_by)
        VALUES (?, ?, ?, ?, ?, 1, 'excused', 'عذر طبي', ?, ?, ?)
        ON CONFLICT(session_id, student_id) DO UPDATE SET
          status = 'excused',
          excuse_id = excluded.excuse_id,
          note = 'عذر طبي',
          updated_at = excluded.updated_at
      `).run(`rec-${sess.id}-${studentId}`, sess.id, classId || null, studentId, date, id, now, byUser);
    }
  })();

  res.json({
    id,
    studentId,
    classId,
    date,
    periodNumber,
    reason: reason || 'عذر طبي',
    excuseType: excuseType || 'medical',
    notes,
    doctorName,
    hospitalName,
    documentUrl: docUrl,
    imageUrl: docUrl,
    fileName,
    uploadedAt: uploadedTime,
    createdAt: now,
    uploadedBy: byUser,
  });
});

app.delete('/api/excuses/:id', requireManager, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM medical_excuses WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// ==========================================
// 7. TIMETABLE & PERIODS ENDPOINTS
// ==========================================

app.get('/api/periods', (req: Request, res: Response) => {
  const rows = db.prepare('SELECT * FROM period_timings ORDER BY period_number ASC').all();
  res.json(rows.map((r: any) => ({
    periodNumber: r.period_number,
    name: r.name,
    startTime: r.start_time,
    endTime: r.end_time,
    isBreak: Boolean(r.is_break),
    attendanceAllowedFrom: r.attendance_allowed_from,
    attendanceAllowedUntil: r.attendance_allowed_until,
    windowMinutes: r.window_minutes,
  })));
});

app.put('/api/periods/:periodNumber', requireManager, (req: AuthRequest, res: Response) => {
  const { periodNumber } = req.params;
  const pNum = Number(periodNumber);
  const existing = db.prepare('SELECT * FROM period_timings WHERE period_number = ?').get(pNum) as any;
  if (!existing) {
    res.status(404).json({ error: 'الحصة غير موجودة' });
    return;
  }

  const { name, startTime, endTime, isBreak, attendanceAllowedFrom, attendanceAllowedUntil, windowMinutes } = req.body;

  db.prepare(`
    UPDATE period_timings
    SET name = ?, start_time = ?, end_time = ?, is_break = ?, attendance_allowed_from = ?, attendance_allowed_until = ?, window_minutes = ?
    WHERE period_number = ?
  `).run(
    name !== undefined ? name : existing.name,
    startTime !== undefined ? startTime : existing.start_time,
    endTime !== undefined ? endTime : existing.end_time,
    isBreak !== undefined ? (isBreak ? 1 : 0) : existing.is_break,
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
    isBreak: Boolean(updatedRow.is_break),
    attendanceAllowedFrom: updatedRow.attendance_allowed_from,
    attendanceAllowedUntil: updatedRow.attendance_allowed_until,
    windowMinutes: updatedRow.window_minutes,
  });
});

app.get('/api/timetable', (req: Request, res: Response) => {
  const { classId, teacherId, day } = req.query;
  let sql = 'SELECT * FROM timetable_slots WHERE 1=1';
  const params: any[] = [];

  if (classId) {
    sql += ' AND class_id = ?';
    params.push(classId);
  }
  if (teacherId) {
    sql += ' AND (teacher_id = ? OR substitute_teacher_id = ?)';
    params.push(teacherId, teacherId);
  }
  if (day !== undefined && day !== null && day !== '') {
    const daysArr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dStr = typeof day === 'number' || !isNaN(Number(day)) ? daysArr[Number(day)] || 'الأحد' : String(day);
    sql += ' AND (day = ? OR day_of_week = ?)';
    params.push(dStr, Number(day) || 0);
  }

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(formatTimetable));
});

app.post('/api/timetable', requireAuth, (req: AuthRequest, res: Response) => {
  const { day, dayOfWeek, periodNumber, timeRange, subject, classId, className, room, roomNumber, teacherId, teacherName, substituteTeacherId, substituteTeacherName } = req.body;
  if (!subject || !classId || !periodNumber) {
    res.status(400).json({ error: 'المادة، الفصل، ورقم الحصة بيانات إجبارية.' });
    return;
  }

  const id = 'tt-' + Date.now();
  const daysArr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayStr = day || daysArr[dayOfWeek || 0] || 'الأحد';
  const dNum = dayOfWeek ?? (daysArr.indexOf(dayStr) !== -1 ? daysArr.indexOf(dayStr) : 0);
  const rm = room || roomNumber || null;

  db.prepare(`
    INSERT INTO timetable_slots (id, day_of_week, day, period_number, time_range, subject, class_id, class_name, room_number, room, teacher_id, teacher_name, substitute_teacher_id, substitute_teacher_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    dNum,
    dayStr,
    Number(periodNumber),
    timeRange || null,
    subject,
    classId,
    className || null,
    rm,
    rm,
    teacherId || null,
    teacherName || null,
    substituteTeacherId || null,
    substituteTeacherName || null
  );

  const newRow = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id);
  res.json(formatTimetable(newRow));
});

app.put('/api/timetable/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'الحصة غير موجودة' });
    return;
  }

  const { day, dayOfWeek, periodNumber, timeRange, subject, classId, className, room, roomNumber, teacherId, teacherName, substituteTeacherId, substituteTeacherName } = req.body;

  const rm = room !== undefined ? room : (roomNumber !== undefined ? roomNumber : existing.room);

  db.prepare(`
    UPDATE timetable_slots
    SET day_of_week = ?, day = ?, period_number = ?, time_range = ?, subject = ?, class_id = ?, class_name = ?, room_number = ?, room = ?, teacher_id = ?, teacher_name = ?, substitute_teacher_id = ?, substitute_teacher_name = ?
    WHERE id = ?
  `).run(
    dayOfWeek !== undefined ? dayOfWeek : existing.day_of_week,
    day !== undefined ? day : existing.day,
    periodNumber !== undefined ? Number(periodNumber) : existing.period_number,
    timeRange !== undefined ? timeRange : existing.time_range,
    subject !== undefined ? subject : existing.subject,
    classId !== undefined ? classId : existing.class_id,
    className !== undefined ? className : existing.class_name,
    rm,
    rm,
    teacherId !== undefined ? teacherId : existing.teacher_id,
    teacherName !== undefined ? teacherName : existing.teacher_name,
    substituteTeacherId !== undefined ? substituteTeacherId : existing.substitute_teacher_id,
    substituteTeacherName !== undefined ? substituteTeacherName : existing.substitute_teacher_name,
    id
  );

  const updatedRow = db.prepare('SELECT * FROM timetable_slots WHERE id = ?').get(id);
  res.json(formatTimetable(updatedRow));
});

app.delete('/api/timetable/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM timetable_slots WHERE id = ?').run(id);
  res.json({ success: true, id });
});

// ==========================================
// 8. SETTINGS & LOCKDOWN ENDPOINTS
// ==========================================

app.get('/api/settings', (req: Request, res: Response) => {
  const row = db.prepare("SELECT * FROM system_settings WHERE id = 'settings'").get() as any;
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
    lockEditingAfterPeriod: Boolean(row.lock_editing_after_period),
    enablePushNotifications: Boolean(row.enable_push_notifications),
    requireExcuseImage: Boolean(row.require_excuse_image),
  });
});

app.put('/api/settings', requireManager, (req: AuthRequest, res: Response) => {
  const updates = req.body;
  const existing = db.prepare("SELECT * FROM system_settings WHERE id = 'settings'").get() as any;

  db.prepare(`
    UPDATE system_settings
    SET school_name = ?, editing_deadline = ?, editing_deadline_enabled = ?, emergency_lockdown = ?, lockdown_time = ?, enable_sms_alerts = ?, pause_alerts_on_holidays = ?, default_all_present = ?, allow_offline_mode = ?, lock_editing_after_period = ?, enable_push_notifications = ?, require_excuse_image = ?
    WHERE id = 'settings'
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
    updates.lockEditingAfterPeriod !== undefined ? (updates.lockEditingAfterPeriod ? 1 : 0) : existing.lock_editing_after_period,
    updates.enablePushNotifications !== undefined ? (updates.enablePushNotifications ? 1 : 0) : existing.enable_push_notifications,
    updates.requireExcuseImage !== undefined ? (updates.requireExcuseImage ? 1 : 0) : existing.require_excuse_image
  );

  const updated = db.prepare("SELECT * FROM system_settings WHERE id = 'settings'").get() as any;
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
    lockEditingAfterPeriod: Boolean(updated.lock_editing_after_period),
    enablePushNotifications: Boolean(updated.enable_push_notifications),
    requireExcuseImage: Boolean(updated.require_excuse_image),
  });
});

app.post('/api/settings/lockdown', requireManager, (req: AuthRequest, res: Response) => {
  const { emergencyLockdown, reason } = req.body;
  const lockdownTime = emergencyLockdown ? new Date().toLocaleTimeString('ar-SA') : null;

  db.prepare(`
    UPDATE system_settings
    SET emergency_lockdown = ?, lockdown_time = ?
    WHERE id = 'settings'
  `).run(emergencyLockdown ? 1 : 0, lockdownTime);

  // Broadcast Notification
  const notifId = 'notif-' + Date.now();
  const title = emergencyLockdown ? 'إغلاق طوارئ للنظام' : 'إلغاء إغلاق الطوارئ';
  const message = emergencyLockdown
    ? `تم تفعيل حظر التعديل الطارئ: ${reason || 'إجراء احترازي إداري لمنع تعديل سجلات الحضور'}`
    : 'تم رفع حظر الطوارئ وإتاحة تسجيل الحضور لجميع المعلمين.';
  const type = emergencyLockdown ? 'emergency' : 'info';
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO notifications (id, title, message, type, created_at, time, is_read, read, recipient_role, class_id)
    VALUES (?, ?, ?, ?, ?, 'الآن', 0, 0, null, null)
  `).run(notifId, title, message, type, now);

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
    createdAt: r.created_at || undefined,
    type: r.type,
    classId: r.class_id || undefined,
    isRead: Boolean(r.is_read || r.read),
    read: Boolean(r.read || r.is_read),
    recipientRole: r.recipient_role || undefined,
  })));
});

app.post('/api/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const { title, message, type, classId, recipientRole } = req.body;
  if (!title || !message) {
    res.status(400).json({ error: 'عنوان ورسالة التنبيه مطلوبة.' });
    return;
  }

  const id = 'notif-' + Date.now();
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO notifications (id, title, message, type, created_at, time, is_read, read, recipient_role, class_id)
    VALUES (?, ?, ?, ?, ?, 'الآن', 0, 0, ?, ?)
  `).run(id, title, message, type || 'info', now, recipientRole || null, classId || null);

  const newRow = db.prepare('SELECT * FROM notifications WHERE id = ?').get(id) as any;
  res.json({
    id: newRow.id,
    title: newRow.title,
    message: newRow.message,
    time: newRow.time,
    createdAt: newRow.created_at,
    type: newRow.type,
    classId: newRow.class_id || undefined,
    isRead: false,
    read: false,
    recipientRole: newRow.recipient_role || undefined,
  });
});

app.delete('/api/notifications/:id', requireAuth, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  res.json({ success: true, id });
});

app.delete('/api/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  db.prepare('DELETE FROM notifications').run();
  res.json({ success: true });
});

app.post('/api/notifications/sms', requireAuth, (req: AuthRequest, res: Response) => {
  const { studentId, message, parentPhone, type } = req.body;
  res.json({
    success: true,
    message: `تم إرسال الرسالة النصية بنجاح إلى الرقم ${parentPhone || 'المسجل'}.`,
    studentId,
    type: type || 'sms',
    timestamp: new Date().toISOString(),
  });
});

// Serve Vite production build static assets if dist folder exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

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

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`✅ Backend server listening on http://localhost:${PORT}`);
  });
}

export { app };
export default app;
