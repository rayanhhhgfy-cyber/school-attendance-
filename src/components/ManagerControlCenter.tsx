/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { UserAccount, PeriodTimingConfig, SchoolClass, Student } from '../types';
import {
  Users,
  Clock,
  KeyRound,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  UserCheck,
  Phone,
  Layers,
  AlertCircle,
  Save,
} from 'lucide-react';

export const ManagerControlCenter: React.FC = () => {
  const {
    users,
    addUserAccount,
    updateUserAccount,
    deleteUserAccount,
    periodTimings,
    updatePeriodTiming,
    classes,
    addClass,
    updateClass,
    deleteClass,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    currentUser,
    setSelectedClassId,
    setSelectedPeriod,
    setActiveTab,
  } = useAttendance();

  const [activeSection, setActiveSection] = useState<'users' | 'timings' | 'classes_students'>('users');

  // User modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'teacher' as 'manager' | 'teacher',
    subject: '',
    phone: '',
    assignedClasses: [] as string[],
  });

  // Class modal state
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [classForm, setClassForm] = useState({
    name: '',
    grade: 'الصف الأول الابتدائي',
    room: 'قاعة 101',
    floor: 'الدور الأرضي',
  });

  // Student modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    classId: classes[0]?.id || 'class-1a',
    seatNumber: 1,
    nationalId: '10' + Math.floor(10000000 + Math.random() * 90000000),
    guardianPhone: '05' + Math.floor(10000000 + Math.random() * 90000000),
  });

  // Period timing edit state
  const [editingTiming, setEditingTiming] = useState<PeriodTimingConfig | null>(null);

  // Open user modal for new
  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      username: '',
      password: '123',
      name: '',
      role: 'teacher',
      subject: 'لغتي الجميلة',
      phone: '05' + Math.floor(10000000 + Math.random() * 90000000),
      assignedClasses: [classes[0]?.id || 'class-1a'],
    });
    setShowUserModal(true);
  };

  // Open user modal for edit
  const handleOpenEditUser = (user: UserAccount) => {
    setEditingUserId(user.id);
    setUserForm({
      username: user.username,
      password: user.password,
      name: user.name,
      role: user.role,
      subject: user.subject || '',
      phone: user.phone || '',
      assignedClasses: user.assignedClasses || [],
    });
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.username.trim() || !userForm.password || !userForm.name.trim()) return;

    if (editingUserId) {
      updateUserAccount(editingUserId, {
        username: userForm.username.trim(),
        password: userForm.password,
        name: userForm.name.trim(),
        role: userForm.role,
        subject: userForm.subject,
        phone: userForm.phone,
        assignedClasses: userForm.assignedClasses,
      });
    } else {
      addUserAccount({
        username: userForm.username.trim(),
        password: userForm.password,
        name: userForm.name.trim(),
        role: userForm.role,
        subject: userForm.subject,
        phone: userForm.phone,
        teacherId: 'staff-' + Math.floor(10 + Math.random() * 90),
        assignedClasses: userForm.assignedClasses,
      });
    }
    setShowUserModal(false);
  };

  // Timing save
  const handleSaveTiming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTiming) return;
    updatePeriodTiming(editingTiming.periodNumber, {
      startTime: editingTiming.startTime,
      endTime: editingTiming.endTime,
      attendanceWindowMinutes: Number(editingTiming.attendanceWindowMinutes),
      isActive: editingTiming.isActive,
    });
    setEditingTiming(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 rounded-full font-bold text-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>صلاحيات المدير الكاملة (أ. ريان)</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">التحكم المركزي بالمنظومة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            مركز تحكم مدير المدرسة
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            إدارة حسابات وكلمات مرور المعلمين، ضبط مواعيد الحصص ونوافذ رصد الغياب، والتحكم بالفصول والطلاب.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveSection('users')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'users'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>المعلمون والحسابات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('timings')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'timings'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>مواعيد الحصص والرصد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('classes_students')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'classes_students'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الفصول والطلاب</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: USERS & CREDENTIALS */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 p-4 rounded-xl border border-purple-200">
            <div>
              <h3 className="text-base font-bold text-purple-950">
                إدارة حسابات الدخول وكلمات المرور للمعلمين
              </h3>
              <p className="text-xs text-purple-800 mt-0.5">
                يمكنك كمدير إنشاء حسابات جديدة للمعلمين، تعديل أسماء المستخدمين، وتغيير كلمات السر فورياً.
              </p>
            </div>
            <button
              type="button"
              id="btn-add-new-teacher-user"
              onClick={handleOpenAddUser}
              className="h-9 px-4 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة معلم جديد</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3">اسم الموظف / المعلم</th>
                  <th className="p-3">اسم المستخدم</th>
                  <th className="p-3">كلمة المرور</th>
                  <th className="p-3">الصلاحية</th>
                  <th className="p-3">المادة / التخصص</th>
                  <th className="p-3">الفصول المسندة</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            u.role === 'manager'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.role === 'manager' ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <GraduationCap className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.name}</span>
                          <span className="text-[11px] text-slate-500 font-mono">{u.phone || '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-900" dir="ltr">
                      {u.username}
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800 bg-slate-50 rounded px-2" dir="ltr">
                      {u.password}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          u.role === 'manager'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                        }`}
                      >
                        {u.role === 'manager' ? 'مدير (كامل الصلاحيات)' : 'معلم (رصد مجموعته)'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{u.subject || '—'}</td>
                    <td className="p-3 text-slate-600">
                      {u.assignedClasses && u.assignedClasses.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.assignedClasses.map(cid => {
                            const c = classes.find(x => x.id === cid);
                            return (
                              <span
                                key={cid}
                                className="px-1.5 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold"
                              >
                                {c?.name || cid}
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400">كافة الفصول (مدير)</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditUser(u)}
                          title="تعديل الحساب وكلمة المرور"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser?.id && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف حساب (${u.name})؟`)) {
                                deleteUserAccount(u.id);
                              }
                            }}
                            title="حذف الحساب"
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: PERIOD TIMINGS & ATTENDANCE WINDOWS */}
      {activeSection === 'timings' && (
        <div className="space-y-4">
          <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200">
            <h3 className="text-base font-bold text-blue-950">
              مواعيد الحصص الدراسية وتوقيت رصد الغياب
            </h3>
            <p className="text-xs text-blue-800 mt-0.5">
              يمكن لمدير المدرسة تغيير موعد بداية ونهاية كل حصة وتحديد نافذة وقت رصد الحضور (بالدقائق) لضمان انضباط التحضير المدرسي.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {periodTimings.map(timing => (
              <div
                key={timing.periodNumber}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 transition flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                      {timing.periodNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{timing.name}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      timing.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {timing.isActive ? 'مفعّلة' : 'معطّلة'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">وقت الحصة:</span>
                    <span className="font-mono font-bold text-slate-800" dir="ltr">
                      {timing.startTime} — {timing.endTime}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">نافذة رصد الغياب:</span>
                    <span className="font-bold text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      خلال أول {timing.attendanceWindowMinutes} دقيقة
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingTiming({ ...timing })}
                  className="w-full h-8 bg-slate-100 hover:bg-blue-50 hover:text-blue-900 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل المواعيد والتوقيت</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CLASSES & STUDENTS */}
      {activeSection === 'classes_students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-xl border border-emerald-200">
            <div>
              <h3 className="text-base font-bold text-emerald-950">
                إدارة الفصول والطلاب والمجموعات
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                إضافة فصول جديدة، تسجيل طلاب، وتعيين الفصول للمعلمين المسؤولين عنها.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingClassId(null);
                  setClassForm({
                    name: '',
                    grade: 'الصف الأول الابتدائي',
                    room: 'قاعة ' + Math.floor(100 + Math.random() * 200),
                    floor: 'الدور الأرضي',
                  });
                  setShowClassModal(true);
                }}
                className="h-9 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة فصل</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingStudentId(null);
                  setStudentForm({
                    name: '',
                    classId: classes[0]?.id || 'class-1a',
                    seatNumber: students.length + 1,
                    nationalId: '10' + Math.floor(10000000 + Math.random() * 90000000),
                    guardianPhone: '05' + Math.floor(10000000 + Math.random() * 90000000),
                  });
                  setShowStudentModal(true);
                }}
                className="h-9 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة طالب</span>
              </button>
            </div>
          </div>

          {/* Classes list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {classes.map(c => {
              const classStudents = students.filter(s => s.classId === c.id);
              return (
                <div
                  key={c.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                    <span className="text-xs text-slate-500">{c.room}</span>
                  </div>
                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span>عدد الطلاب:</span>
                    <span className="font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded font-mono">
                      {classStudents.length} طالب
                    </span>
                  </div>
                  <div className="flex items-center gap-1 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassId(c.id);
                        setActiveTab('take_attendance');
                      }}
                      className="flex-1 h-7 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold text-xs rounded-lg transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>رصد الحضور</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف فصل (${c.name})؟`)) {
                          deleteClass(c.id);
                        }
                      }}
                      className="h-7 w-7 text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* USER MODAL (Add/Edit) */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="bg-purple-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingUserId ? 'تعديل حساب وبيانات المعلم' : 'إضافة حساب معلم جديد'}
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل:</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="مثال: أ. محمد العتيبي"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (Username):</label>
                  <input
                    type="text"
                    value={userForm.username}
                    onChange={e => setUserForm(prev => ({ ...prev, username: e.target.value }))}
                    required
                    dir="ltr"
                    placeholder="mohammed"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-mono text-left"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">كلمة المرور (Password):</label>
                  <input
                    type="text"
                    value={userForm.password}
                    onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    required
                    dir="ltr"
                    placeholder="123"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-mono text-left font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الصلاحية:</label>
                  <select
                    value={userForm.role}
                    onChange={e =>
                      setUserForm(prev => ({ ...prev, role: e.target.value as 'manager' | 'teacher' }))
                    }
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-semibold"
                  >
                    <option value="teacher">معلم (رصد مجموعته)</option>
                    <option value="manager">مدير (صلاحيات كاملة)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المادة / التخصص:</label>
                  <input
                    type="text"
                    value={userForm.subject}
                    onChange={e => setUserForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="الرياضيات"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الفصول المسندة للمعلم:</label>
                <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  {classes.map(c => {
                    const isChecked = userForm.assignedClasses.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-1.5 text-xs text-slate-800 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setUserForm(prev => ({
                                ...prev,
                                assignedClasses: [...prev.assignedClasses, c.id],
                              }));
                            } else {
                              setUserForm(prev => ({
                                ...prev,
                                assignedClasses: prev.assignedClasses.filter(x => x !== c.id),
                              }));
                            }
                          }}
                          className="rounded text-purple-900 cursor-pointer"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-purple-900 hover:bg-purple-800 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                >
                  حفظ الحساب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PERIOD TIMING MODAL */}
      {editingTiming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                تعديل مواعيد: {editingTiming.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingTiming(null)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTiming} className="p-4 space-y-3 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت البداية:</label>
                  <input
                    type="time"
                    value={editingTiming.startTime}
                    onChange={e =>
                      setEditingTiming(prev => (prev ? { ...prev, startTime: e.target.value } : null))
                    }
                    required
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">وقت النهاية:</label>
                  <input
                    type="time"
                    value={editingTiming.endTime}
                    onChange={e =>
                      setEditingTiming(prev => (prev ? { ...prev, endTime: e.target.value } : null))
                    }
                    required
                    className="w-full h-9 px-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  نافذة رصد الغياب (بالدقائق من بداية الحصة):
                </label>
                <input
                  type="number"
                  min={5}
                  max={45}
                  value={editingTiming.attendanceWindowMinutes}
                  onChange={e =>
                    setEditingTiming(prev =>
                      prev ? { ...prev, attendanceWindowMinutes: Number(e.target.value) } : null
                    )
                  }
                  required
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  المدة المسموحة للمعلم لرصد الحضور بعد قرع جرس بداية الحصة.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="timing-is-active"
                  checked={editingTiming.isActive}
                  onChange={e =>
                    setEditingTiming(prev =>
                      prev ? { ...prev, isActive: e.target.checked } : null
                    )
                  }
                  className="rounded text-blue-900 cursor-pointer"
                />
                <label htmlFor="timing-is-active" className="font-bold text-slate-800 cursor-pointer">
                  تفعيل هذه الحصة في الجدول اليومي
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTiming(null)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold transition cursor-pointer shadow-xs"
                >
                  حفظ المواعيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLASS MODAL */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="bg-emerald-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">إضافة فصل دراسي جديد</h3>
              <button
                type="button"
                onClick={() => setShowClassModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!classForm.name.trim()) return;
                addClass({
                  name: classForm.name.trim(),
                  grade: classForm.grade,
                  room: classForm.room,
                  floor: classForm.floor,
                  studentCount: 0,
                });
                setShowClassModal(false);
              }}
              className="p-4 space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الفصل:</label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={e => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="الصف الرابع (أ)"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القاعة / الغرفة:</label>
                <input
                  type="text"
                  value={classForm.room}
                  onChange={e => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="قاعة 205"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  حفظ الفصل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT MODAL */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">تسجيل طالب جديد</h3>
              <button
                type="button"
                onClick={() => setShowStudentModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (!studentForm.name.trim()) return;
                addStudent({
                  name: studentForm.name.trim(),
                  classId: studentForm.classId,
                  seatNumber: Number(studentForm.seatNumber),
                  nationalId: studentForm.nationalId,
                  guardianPhone: studentForm.guardianPhone,
                  medicalAlert: false,
                });
                setShowStudentModal(false);
              }}
              className="p-4 space-y-3 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الطالب الرباعي:</label>
                <input
                  type="text"
                  value={studentForm.name}
                  onChange={e => setStudentForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="محمد عبدالله الشهري"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                <select
                  value={studentForm.classId}
                  onChange={e => setStudentForm(prev => ({ ...prev, classId: e.target.value }))}
                  className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم المقعد:</label>
                  <input
                    type="number"
                    min={1}
                    value={studentForm.seatNumber}
                    onChange={e =>
                      setStudentForm(prev => ({ ...prev, seatNumber: Number(e.target.value) }))
                    }
                    required
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف ولي الأمر:</label>
                  <input
                    type="text"
                    value={studentForm.guardianPhone}
                    onChange={e =>
                      setStudentForm(prev => ({ ...prev, guardianPhone: e.target.value }))
                    }
                    required
                    dir="ltr"
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-left"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowStudentModal(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  تسجيل الطالب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
