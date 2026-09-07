# مدرسة الملك حسين بن طلال الثانوية للبنين - المنظومة الرقمية لرصد الحضور الذكي والغياب الميداني

تطبيق ويب متكامل ومعاصر لرصد حضور وغياب الطلاب بحسب الحصص والفصول والمواد الدراسية، مبني باستخدام React 19، TypeScript، Tailwind CSS، وVite.

---

## 🤖 دليل ربط التطبيق بقاعدة البيانات والباك إند (Backend & Database Setup Prompt)

> **تعليمات للاستخدام:** انسخ النص التالي بالكامل في نافذة الذكاء الاصطناعي (AI Agent/Assistant) ليقوم بقراءة بنيان المشروع بالكامل ثم سؤالك عن نوع قاعدة البيانات والباك إند المفضلة لديك (مثل PostgreSQL, MySQL, Supabase, Node.js/Express, Python/FastAPI, Firebase, إلخ) والبدء في التنفيذ المباشر فوراً!

```markdown
### 🚀 SYSTEM PROMPT: CONNECT BACKEND & DATABASE TO SCHOOL ATTENDANCE SYSTEM

You are an expert Full-Stack Software Engineer & Database Architect.
Your task is to connect a production-ready backend API and persistent database to this React 19 + TypeScript + Vite School Attendance Application ("مدرسة الملك حسين بن طلال الثانوية للبنين").

#### 1. INITIAL REASONING & USER QUESTION
First, read this entire system prompt and examine the frontend data models. Before writing any code or executing any commands, ask the user the following single question:
"مرحباً بك! أنا جاهز لتوصيل المنظومة المدرسية بالباك إند وقاعدة البيانات. ما هي التقنيات التي تفضل استخدامها للباك إند وقاعدة البيانات؟
(أمثلة: 1. Node.js + Express + PostgreSQL / Supabase, 2. Node.js + Prisma + MySQL, 3. Python FastAPI + PostgreSQL, 4. Firebase / Firestore, 5. أي خيار آخر تراه مناسباً)."

Once the user replies with their choice, immediately execute step 2 onwards to implement and connect the full backend and database.

---

#### 2. DATA SCHEMA & ENTITY MODELS (Source of Truth)
The application currently maintains state inside `src/context/AttendanceContext.tsx` and `src/types/index.ts`. You must design database tables/collections matching these exact structures:

1. **Users (`users` table)**:
   - `id`: string (PRIMARY KEY, e.g. UUID)
   - `username`: string (UNIQUE)
   - `password`: string (Hashed using bcrypt)
   - `name`: string
   - `role`: 'manager' | 'teacher'
   - `subject`: string (Optional)
   - `phone`: string (Optional)
   - `teacher_id`: string (Optional)
   - `assigned_classes`: JSON Array of class IDs

2. **Classes (`classes` table)**:
   - `id`: string (PRIMARY KEY)
   - `name`: string (e.g., 'الصف التاسع (أ)')
   - `grade_level`: string
   - `room`: string
   - `homeroom_teacher`: string
   - `student_count`: integer

3. **Students (`students` table)**:
   - `id`: string (PRIMARY KEY)
   - `name`: string
   - `seat_number`: integer
   - `class_id`: string (FOREIGN KEY -> classes.id)
   - `avatar_seed`: string
   - `parent_name`: string
   - `parent_phone`: string
   - `guardian_phone`: string
   - `consecutive_absences`: integer
   - `health_note`: string (Optional)
   - `academic_note`: string (Optional)

4. **Attendance Sessions (`attendance_sessions` table)**:
   - `id`: string (PRIMARY KEY)
   - `class_id`: string (FOREIGN KEY -> classes.id)
   - `period_number`: integer (1..7)
   - `date`: string (YYYY-MM-DD)
   - `submitted_at`: string (ISO Timestamp)
   - `submitted_by_user_id`: string (FOREIGN KEY -> users.id)
   - `submitted_teacher_name`: string
   - UNIQUE CONSTRAINT on (`class_id`, `period_number`, `date`)

5. **Attendance Records (`attendance_records` table)**:
   - `id`: string (PRIMARY KEY)
   - `session_id`: string (FOREIGN KEY -> attendance_sessions.id)
   - `student_id`: string (FOREIGN KEY -> students.id)
   - `status`: 'present' | 'absent' | 'late' | 'excused'
   - `note`: string (Optional)
   - `updated_at`: string (ISO Timestamp)

6. **Medical Excuses (`medical_excuses` table)**:
   - `id`: string (PRIMARY KEY)
   - `student_id`: string (FOREIGN KEY -> students.id)
   - `date`: string (YYYY-MM-DD)
   - `note`: string
   - `image_base64_or_url`: text
   - `uploaded_by`: string

7. **Timetable / Schedule (`timetable_slots` table)**:
   - `id`: string (PRIMARY KEY)
   - `day`: string ('الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس')
   - `period_number`: integer
   - `class_id`: string (FOREIGN KEY -> classes.id)
   - `class_name`: string
   - `subject`: string
   - `teacher_id`: string (FOREIGN KEY -> users.id)
   - `teacher_name`: string
   - `substitute_teacher_id`: string (Optional)
   - `substitute_teacher_name`: string (Optional)

8. **Settings & Logs (`system_settings` table)**:
   - `id`: string (PRIMARY KEY, single row)
   - `school_name`: string
   - `editing_deadline`: string ('14:00')
   - `editing_deadline_enabled`: boolean
   - `attendance_change_count`: integer
   - `emergency_lockdown`: boolean

---

#### 3. REQUIRED API ENDPOINTS
Implement RESTful or GraphQL endpoints supporting JWT authentication:
- `POST /api/auth/login` - Authenticate user & return JWT token.
- `GET /api/auth/me` - Fetch currently logged-in user profile.
- `GET /api/users` - List all teachers and managers.
- `POST /api/users` - Add user account.
- `PUT /api/users/:id` - Update user account / password.
- `DELETE /api/users/:id` - Delete user account.
- `GET /api/classes` - List classes.
- `POST /api/classes` - Create class (Manager only).
- `GET /api/students` - List students (filter by classId).
- `POST /api/students` - Add single student or bulk import.
- `PUT /api/students/:id` - Update student info.
- `DELETE /api/students/:id` - Delete student.
- `GET /api/attendance?classId=...&date=...&period=...` - Fetch session & records.
- `POST /api/attendance/submit` - Submit/Save attendance session.
- `POST /api/attendance/reopen` - Reopen session for editing.
- `POST /api/excuses` - Upload medical excuse.
- `GET /api/excuses?studentId=...&date=...` - Get medical excuse.
- `GET /api/timetable` - List timetable slots.
- `PUT /api/timetable/:id/substitute` - Delegate substitute teacher.
- `GET /api/settings` - Get system settings.
- `PUT /api/settings` - Update settings & deadline locks.

---

#### 4. FRONTEND INTEGRATION INSTRUCTIONS
In `src/context/AttendanceContext.tsx`:
1. Replace `localStorage` mock syncs with asynchronous `fetch` or `axios` API calls.
2. Store JWT tokens in `localStorage.setItem('auth_token', token)` and pass `Authorization: Bearer <token>` in requests.
3. Keep fallback initial states or loading spinners while data fetches asynchronously.
4. Test all core CUJs (Login, Take Attendance, History, Medical Excuse, Manager Controls) to ensure full operational status.
```
