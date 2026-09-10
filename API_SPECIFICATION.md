# 🤖 AI Prompt: Complete Backend Implementation & Frontend Integration Guide
## المنظومة الرقمية لرصد الحضور الذكي والغياب الميداني (مدرسة الملك حسين بن طلال الثانوية للبنين)

> **Instructions for the User:** Copy and paste the prompt below into any AI Assistant (like ChatGPT, Claude, Cursor, or Jules) to automatically build the full backend API and connect it directly to this React 19 + TypeScript frontend application!

```markdown
### 🚀 SYSTEM PROMPT: FULL-STACK BACKEND GENERATION & FRONTEND INTEGRATION BLUEPRINT

You are an expert Full-Stack Software Engineer & Database Architect.
Your task is to implement a complete, production-ready backend (API + Database) for this React 19 + TypeScript + Vite School Attendance Application ("مدرسة الملك حسين بن طلال الثانوية للبنين") and wire it to the frontend context (`src/context/AttendanceContext.tsx`).

---

#### 1. INITIAL SETUP & DATABASE SCHEMA (Source of Truth)
Design database tables/collections matching the exact frontend models in `src/types.ts`:

1. **Users (`users` table)**:
   - `id`: string (PRIMARY KEY, UUID)
   - `username`: string (UNIQUE)
   - `password`: string (Hashed with bcrypt)
   - `name`: string
   - `role`: 'manager' | 'teacher'
   - `teacher_id`: string (Optional)
   - `subject`: string (Optional)
   - `phone`: string (Optional)
   - `assigned_classes`: JSON Array of class IDs
   - `permissions`: JSON Object (TeacherPermissions)

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
   - `guardian_phone`: string (Optional)
   - `consecutive_absences`: integer
   - `health_note`: text (Optional)
   - `academic_note`: text (Optional)

4. **Attendance Sessions (`attendance_sessions` table)**:
   - `id`: string (PRIMARY KEY)
   - `class_id`: string (FOREIGN KEY -> classes.id)
   - `period_number`: integer (1..7)
   - `date`: string (YYYY-MM-DD)
   - `is_submitted`: boolean
   - `submitted_at`: string (ISO Timestamp)
   - `submitted_by_user_id`: string (FOREIGN KEY -> users.id)
   - `submitted_teacher_name`: string
   - UNIQUE CONSTRAINT on (`class_id`, `period_number`, `date`)

5. **Attendance Records (`attendance_records` table)**:
   - `id`: string (PRIMARY KEY)
   - `session_id`: string (FOREIGN KEY -> attendance_sessions.id)
   - `student_id`: string (FOREIGN KEY -> students.id)
   - `status`: 'present' | 'absent' | 'late' | 'excused'
   - `note`: text (Optional)
   - `updated_at`: string (ISO Timestamp)

6. **Medical Excuses (`medical_excuses` table)**:
   - `id`: string (PRIMARY KEY)
   - `student_id`: string (FOREIGN KEY -> students.id)
   - `date`: string (YYYY-MM-DD)
   - `image_url`: text (Base64 or S3 URL)
   - `file_name`: string (Optional)
   - `uploaded_at`: string
   - `uploaded_by`: string

7. **Timetable / Schedule (`timetable_slots` table)**:
   - `id`: string (PRIMARY KEY)
   - `day`: string ('الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس')
   - `period_number`: integer
   - `time_range`: string
   - `subject`: string
   - `class_id`: string (FOREIGN KEY -> classes.id)
   - `class_name`: string
   - `room`: string
   - `teacher_id`: string (FOREIGN KEY -> users.id)
   - `teacher_name`: string
   - `substitute_teacher_id`: string (Optional)
   - `substitute_teacher_name`: string (Optional)

8. **Period Timings (`period_timings` table)**:
   - `period_number`: integer (PRIMARY KEY)
   - `name`: string
   - `start_time`: string
   - `end_time`: string
   - `attendance_allowed_from`: string
   - `attendance_allowed_until`: string
   - `window_minutes`: integer

9. **System Settings (`system_settings` table)**:
   - `id`: string (PRIMARY KEY, single row)
   - `school_name`: string
   - `editing_deadline`: string
   - `editing_deadline_enabled`: boolean
   - `emergency_lockdown`: boolean
   - `lockdown_time`: string (Optional)
   - `enable_sms_alerts`: boolean
   - `pause_alerts_on_holidays`: boolean
   - `default_all_present`: boolean
   - `allow_offline_mode`: boolean
   - `enable_push_notifications`: boolean
   - `require_excuse_image`: boolean

10. **Notifications (`notifications` table)**:
    - `id`: string (PRIMARY KEY)
    - `title`: string
    - `message`: text
    - `time`: string
    - `type`: 'reminder' | 'warning' | 'info'
    - `class_id`: string (Optional)
    - `read`: boolean

---

#### 2. EXHAUSTIVE REST API ENDPOINTS SPECIFICATION

##### 1. Authentication (`/api/auth`)
* `POST /api/auth/login` - Authenticate user & return JWT token + user object.
* `POST /api/auth/register` - Create new teacher/manager account.
* `GET /api/auth/me` - Fetch currently logged-in user profile from JWT Bearer token.

##### 2. Users & Staff (`/api/users` & `/api/staff`)
* `GET /api/users` - Fetch all user accounts and staff members.
* `POST /api/users` - Add user account.
* `PUT /api/users/:id` - Update user account / password / permissions.
* `DELETE /api/users/:id` - Delete user account.
* `PUT /api/staff/:id/role` - Update staff role ('admin' | 'supervisor' | 'teacher') and status ('نشط' | 'في إجازة').

##### 3. Classes (`/api/classes`)
* `GET /api/classes` - Fetch all school classes.
* `POST /api/classes` - Create class.
* `PUT /api/classes/:id` - Update class name, grade level, or room.
* `DELETE /api/classes/:id` - Delete class.

##### 4. Students (`/api/students`)
* `GET /api/students` - Fetch students (filter by `classId` query param).
* `POST /api/students` - Add single student (name, seat number, parent contact).
* `POST /api/students/bulk` - Bulk insert students into class.
* `PUT /api/students/:id` - Update student information.
* `DELETE /api/students/:id` - Delete student.
* `POST /api/students/extract-names` - Extract names from OCR file upload or Excel text parsing.

##### 5. Attendance Operations (`/api/attendance`)
* `GET /api/attendance` - Query params: `classId`, `date`, `period`. Fetch attendance session and student records.
* `POST /api/attendance/record` - Record status for a single student.
* `POST /api/attendance/submit` - Submit and freeze session.
* `POST /api/attendance/reset` - Reset session attendance records.
* `POST /api/attendance/reopen` - Reopen session for editing.
* `GET /api/attendance/stats` - Query params: `date`, `startDate`, `endDate`, `classId`. Aggregate statistics for dashboards and reports.

##### 6. Medical Excuses (`/api/excuses`)
* `POST /api/excuses` - Upload medical excuse (base64/image).
* `GET /api/excuses` - Fetch student excuses by `studentId` and `date`.
* `DELETE /api/excuses/:id` - Delete medical excuse.

##### 7. Timetable & Period Timings (`/api/timetable` & `/api/periods`)
* `GET /api/timetable` - Get full schedule slots.
* `POST /api/timetable` - Add timetable slot.
* `PUT /api/timetable/:id` - Update timetable slot / assign substitute teacher (`substituteTeacherId`).
* `DELETE /api/timetable/:id` - Delete timetable slot.
* `GET /api/periods` & `PUT /api/periods/:periodNumber` - Get and update period timing windows.

##### 8. Settings & Emergency Lockdown (`/api/settings`)
* `GET /api/settings` - Get system settings.
* `PUT /api/settings` - Update settings & editing deadline.
* `POST /api/settings/lockdown` - Toggle emergency lockdown.

##### 9. Notifications & SMS Alerts (`/api/notifications`)
* `GET /api/notifications` - Get app notifications.
* `POST /api/notifications` - Broadcast notification.
* `DELETE /api/notifications/:id` - Dismiss notification.
* `POST /api/notifications/sms` - Trigger SMS / WhatsApp alert to parent.

---

#### 3. FRONTEND INTEGRATION INSTRUCTIONS
Modify `src/context/AttendanceContext.tsx`:
1. Replace `localStorage` mock state initialization with `useEffect` async `fetch()` or `axios` calls to backend endpoints.
2. Store JWT in `localStorage.setItem('auth_token', token)` upon login and pass `Authorization: Bearer ${token}` header in all requests.
3. Replace all mutation handlers (`addStudent`, `submitAttendanceSession`, `updateUserAccount`, etc.) to call corresponding API endpoints.
4. Verify all frontend views (`TakeAttendanceView`, `StudentManagementModal`, `AdminDashboardView`, `ManagerControlCenter`) function seamlessly with the backend.
```
