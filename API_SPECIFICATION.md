# API Specification & Endpoint Blueprint
## المنظومة الرقمية لرصد الحضور الذكي والغياب الميداني (مدرسة الملك حسين بن طلال الثانوية للبنين)

This document provides a comprehensive, exhaustive blueprint of all REST API endpoints required by this frontend application.

---

## 1. Authentication & Session Management (`/api/auth`)

### 1.1 Login User
* **Endpoint:** `POST /api/auth/login`
* **Access:** Public
* **Description:** Authenticates user (Teacher or Manager) using username and password. Returns JWT token and User object.
* **Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```
* **Response (200 OK):**
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "username": "string",
    "name": "string",
    "role": "manager | teacher",
    "teacherId": "string (optional)",
    "assignedClasses": ["classId"],
    "phone": "string",
    "subject": "string",
    "permissions": {}
  }
}
```

### 1.2 Register User
* **Endpoint:** `POST /api/auth/register`
* **Access:** Manager / Admin
* **Description:** Creates a new teacher or manager account.
* **Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "name": "string",
  "role": "manager | teacher",
  "phone": "string",
  "subject": "string",
  "assignedClasses": ["classId"],
  "permissions": {}
}
```

### 1.3 Get Current User Profile (`Me`)
* **Endpoint:** `GET /api/auth/me`
* **Access:** Authenticated
* **Headers:** `Authorization: Bearer <token>`
* **Response (200 OK):** `UserAccount` object.

---

## 2. User & Staff Management (`/api/users` & `/api/staff`)

### 2.1 Get All Users / Staff
* **Endpoint:** `GET /api/users`
* **Access:** Manager
* **Response (200 OK):** Array of `UserAccount` / `StaffMember`.

### 2.2 Add User Account
* **Endpoint:** `POST /api/users`
* **Access:** Manager
* **Request Body:** `Omit<UserAccount, 'id'>`

### 2.3 Update User Account
* **Endpoint:** `PUT /api/users/:id`
* **Access:** Manager or self (for profile details)
* **Request Body:** `Partial<UserAccount>`

### 2.4 Delete User Account
* **Endpoint:** `DELETE /api/users/:id`
* **Access:** Manager

### 2.5 Update Staff Role & Status
* **Endpoint:** `PUT /api/staff/:id/role`
* **Access:** Manager
* **Request Body:**
```json
{
  "role": "admin | supervisor | teacher",
  "status": "نشط | في إجازة"
}
```

---

## 3. Class Management (`/api/classes`)

### 3.1 List All Classes
* **Endpoint:** `GET /api/classes`
* **Access:** Authenticated
* **Response (200 OK):** Array of `SchoolClass` objects.

### 3.2 Create Class
* **Endpoint:** `POST /api/classes`
* **Access:** Manager (or teacher with `canAddClasses` permission)
* **Request Body:**
```json
{
  "name": "string (e.g., الصف التاسع (أ))",
  "gradeLevel": "string",
  "room": "string",
  "homeroomTeacher": "string"
}
```

### 3.3 Update Class
* **Endpoint:** `PUT /api/classes/:id`
* **Access:** Manager / Authorized Teacher
* **Request Body:** `Partial<SchoolClass>`

### 3.4 Delete Class
* **Endpoint:** `DELETE /api/classes/:id`
* **Access:** Manager

---

## 4. Student Management (`/api/students`)

### 4.1 List Students
* **Endpoint:** `GET /api/students`
* **Query Parameters:** `classId` (optional), `search` (optional)
* **Access:** Authenticated
* **Response (200 OK):** Array of `Student` objects.

### 4.2 Add Single Student
* **Endpoint:** `POST /api/students`
* **Access:** Manager / Teacher with permission
* **Request Body:**
```json
{
  "name": "string",
  "seatNumber": 1,
  "classId": "string",
  "parentName": "string",
  "parentPhone": "string",
  "guardianPhone": "string",
  "healthNote": "string (optional)",
  "academicNote": "string (optional)"
}
```

### 4.3 Bulk Add / Import Students
* **Endpoint:** `POST /api/students/bulk`
* **Access:** Manager / Teacher with permission
* **Request Body:**
```json
{
  "classId": "string",
  "students": [
    {
      "name": "string",
      "seatNumber": 1,
      "parentPhone": "string"
    }
  ]
}
```

### 4.4 Update Student Information
* **Endpoint:** `PUT /api/students/:id`
* **Access:** Manager / Teacher with permission
* **Request Body:** `Partial<Student>`

### 4.5 Delete Student
* **Endpoint:** `DELETE /api/students/:id`
* **Access:** Manager / Teacher with permission

### 4.6 OCR / File Scan Student Names Extraction
* **Endpoint:** `POST /api/students/extract-names`
* **Access:** Authenticated
* **Request Body:** `FormData` containing image or excel file.
* **Response (200 OK):**
```json
{
  "extractedNames": ["string"]
}
```

---

## 5. Attendance Operations (`/api/attendance`)

### 5.1 Fetch Attendance Session & Records
* **Endpoint:** `GET /api/attendance`
* **Query Parameters:** `classId`, `date` (YYYY-MM-DD), `period` (number 1..7)
* **Access:** Authenticated
* **Response (200 OK):**
```json
{
  "sessionKey": "classId_date_pPeriod",
  "isSubmitted": boolean,
  "meta": {
    "submittedAt": "ISO string",
    "submittedBy": "userId",
    "submittedTeacherName": "string",
    "total": 30,
    "present": 28,
    "absent": 1,
    "late": 1,
    "excused": 0
  },
  "records": {
    "studentId": {
      "studentId": "string",
      "status": "present | absent | late | excused",
      "note": "string",
      "updatedAt": "ISO string"
    }
  }
}
```

### 5.2 Record / Update Single Student Attendance Status
* **Endpoint:** `POST /api/attendance/record`
* **Access:** Authenticated (Enforces teacher assignment and deadline permissions)
* **Request Body:**
```json
{
  "classId": "string",
  "date": "YYYY-MM-DD",
  "period": 1,
  "studentId": "string",
  "status": "present | absent | late | excused",
  "note": "string (optional)"
}
```

### 5.3 Submit Attendance Session
* **Endpoint:** `POST /api/attendance/submit`
* **Access:** Authenticated Teacher / Manager
* **Request Body:**
```json
{
  "classId": "string",
  "date": "YYYY-MM-DD",
  "period": 1,
  "records": {
    "studentId": {
      "studentId": "string",
      "status": "present | absent | late | excused",
      "note": "string"
    }
  }
}
```

### 5.4 Reset Attendance Session
* **Endpoint:** `POST /api/attendance/reset`
* **Access:** Authenticated Teacher / Manager
* **Request Body:**
```json
{
  "classId": "string",
  "date": "YYYY-MM-DD",
  "period": 1
}
```

### 5.5 Reopen Attendance Session for Editing
* **Endpoint:** `POST /api/attendance/reopen`
* **Access:** Manager or Teacher with `canReopenAttendance` permission
* **Request Body:**
```json
{
  "classId": "string",
  "date": "YYYY-MM-DD",
  "period": 1
}
```

### 5.6 Get Overall Attendance Statistics & Reports
* **Endpoint:** `GET /api/attendance/stats`
* **Query Parameters:** `date`, `startDate`, `endDate`, `classId`
* **Access:** Authenticated

---

## 6. Medical Excuses (`/api/excuses`)

### 6.1 Upload Medical Excuse Image
* **Endpoint:** `POST /api/excuses`
* **Access:** Authenticated Teacher / Manager
* **Request Body:**
```json
{
  "studentId": "string",
  "date": "YYYY-MM-DD",
  "imageUrl": "base64 or S3 URL",
  "fileName": "string"
}
```

### 6.2 Get Student Medical Excuse
* **Endpoint:** `GET /api/excuses`
* **Query Parameters:** `studentId`, `date`
* **Access:** Authenticated

### 6.3 Delete Medical Excuse
* **Endpoint:** `DELETE /api/excuses/:id`
* **Access:** Manager / Teacher with `canDeleteExcuses` permission

---

## 7. Timetable & Schedule (`/api/timetable` & `/api/periods`)

### 7.1 Get Timetable Slots
* **Endpoint:** `GET /api/timetable`
* **Query Parameters:** `teacherId`, `classId`, `day`
* **Access:** Authenticated

### 7.2 Add Timetable Slot
* **Endpoint:** `POST /api/timetable`
* **Access:** Manager / Schedule Administrator

### 7.3 Update Timetable Slot / Assign Substitute Teacher
* **Endpoint:** `PUT /api/timetable/:id`
* **Access:** Manager / Teacher with permission
* **Request Body:**
```json
{
  "substituteTeacherId": "string",
  "substituteTeacherName": "string",
  "subject": "string",
  "room": "string"
}
```

### 7.4 Delete Timetable Slot
* **Endpoint:** `DELETE /api/timetable/:id`
* **Access:** Manager

### 7.5 Get & Update Period Timings
* **Endpoint:** `GET /api/periods` & `PUT /api/periods/:periodNumber`
* **Access:** Manager

---

## 8. System Settings & Lockdown (`/api/settings`)

### 8.1 Get System Settings
* **Endpoint:** `GET /api/settings`
* **Access:** Authenticated

### 8.2 Update System Settings
* **Endpoint:** `PUT /api/settings`
* **Access:** Manager
* **Request Body:** `Partial<SystemSettings>`

### 8.3 Toggle Emergency Lockdown
* **Endpoint:** `POST /api/settings/lockdown`
* **Access:** Manager
* **Request Body:**
```json
{
  "emergencyLockdown": true,
  "reason": "string"
}
```

---

## 9. Notifications & SMS Alerts (`/api/notifications`)

### 9.1 Get App Notifications
* **Endpoint:** `GET /api/notifications`
* **Access:** Authenticated

### 9.2 Add Broadcast / Test Notification
* **Endpoint:** `POST /api/notifications`
* **Access:** Manager

### 9.3 Dismiss / Clear Notifications
* **Endpoint:** `DELETE /api/notifications/:id` & `DELETE /api/notifications`
* **Access:** Authenticated

### 9.4 Send Parent SMS / WhatsApp Alert Trigger
* **Endpoint:** `POST /api/notifications/sms`
* **Access:** Authenticated Teacher / Manager
* **Request Body:**
```json
{
  "studentId": "string",
  "parentPhone": "string",
  "messageType": "absence | late | praise",
  "messageText": "string"
}
```
