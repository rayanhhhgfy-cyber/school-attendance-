/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { UserAccount, PeriodTimingConfig, SchoolClass, Student, TimetableSlot } from '../types';
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
  Search,
  UserPlus,
  Filter,
  Pencil,
  School,
  History,
  Lock,
  Bell,
} from 'lucide-react';
import { AssignedClassesSelector } from './AssignedClassesSelector';

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
    timetable,
    updateTimetableSlot,
    setSelectedClassId,
    setSelectedPeriod,
    setActiveTab,
    attendanceChangeCount,
    settings,
    updateSetting,
    requestNotificationPermission,
  } = useAttendance();

  const [activeSection, setActiveSection] = useState<'users' | 'substitutes' | 'timings' | 'classes_students' | 'manager_controls'>('users');

  // Substitute Management Filter & Modal State
  const [subFilterDay, setSubFilterDay] = useState<string>('all');
  const [subFilterClass, setSubFilterClass] = useState<string>('all');
  const [subSearch, setSubSearch] = useState<string>('');
  const [editingSubSlot, setEditingSubSlot] = useState<TimetableSlot | null>(null);
  const [subNameInput, setSubNameInput] = useState<string>('');
  const [subSelectUserId, setSubSelectUserId] = useState<string>('');

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
    grade: 'الصف التاسع (9th)',
    room: 'قاعة 101',
    floor: 'الدور الأرضي',
  });

  // Student modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentForm, setStudentForm] = useState({
    name: '',
    classId: classes[0]?.id || 'class-9th',
    seatNumber: 1,
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
      subject: 'اللغة العربية والمهارات اللغوية',
      phone: '05' + Math.floor(10000000 + Math.random() * 90000000),
      assignedClasses: [classes[0]?.id || 'class-9th'],
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
      windowMinutes: Number(editingTiming.windowMinutes),
    });
    setEditingTiming(null);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs p-4 sm:p-6 space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 rounded-full font-bold text-xs flex items-center gap-1 border border-purple-200 dark:border-purple-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
              <span>صلاحيات المدير الكاملة (أ. ريان)</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">التحكم المركزي بالمنظومة</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            مركز تحكم مدير المدرسة
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
            إدارة حسابات المعلمين، ضبط الموعد النهائي لمنع التعديل، وتتبع إجمالي عدد التغييرات على الحضور.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl border border-slate-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setActiveSection('manager_controls')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'manager_controls'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>الموعد النهائي والإعدادات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('users')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'users'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>المعلمون والحسابات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('substitutes')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'substitutes'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>المعلم البديل والمناوبة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('timings')}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeSection === 'timings'
                ? 'bg-purple-900 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
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
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الفصول والطلاب</span>
          </button>
        </div>
      </div>

      {/* STATS STRIP: ATTENDANCE CHANGE COUNTER */}
      <div className="p-4 bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <History className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <span className="text-xs text-purple-200 font-bold block">إحصائية حية لمدير المدرسة</span>
            <h3 className="text-lg font-black text-white">إجمالي عدد مرات تعديل كشوف الحضور</h3>
            <p className="text-xs text-purple-100 opacity-90 mt-0.5">
              يتم احتساب كل تعديل أو إعادة فتح لكشوفات الحضور لضمان الشفافية.
            </p>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center font-mono shrink-0">
          <span className="text-2xl sm:text-3xl font-black text-amber-300 block leading-none">
            {attendanceChangeCount}
          </span>
          <span className="text-[11px] font-sans font-bold text-white mt-1 block">تعديلات مسجلة</span>
        </div>
      </div>

      {/* SECTION: MANAGER DEADLINE & ADVANCED CONTROLS */}
      {activeSection === 'manager_controls' && (
        <div className="space-y-4">
          {/* Deadline Cutoff Configuration */}
          <div className="p-5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 dark:border-neutral-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>تحديد موعد نهائي يومي لمنع التعديل على الحضور (Cutoff Deadline)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  عند تفعيل هذه الخاصية وتجاوز الوقت المحدد، يُقفل النظام تلقائياً ولا يُسمح للمعلمين بإجراء أي تعديلات جديدة على الكشوفات.
                </p>
              </div>

              <button
                type="button"
                onClick={() => updateSetting('editingDeadlineEnabled', !settings.editingDeadlineEnabled)}
                className="p-1 rounded-xl cursor-pointer shrink-0"
              >
                {settings.editingDeadlineEnabled ? (
                  <div className="w-12 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                    <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                  </div>
                ) : (
                  <div className="w-12 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                    <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                  </div>
                )}
              </button>
            </div>

            {settings.editingDeadlineEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    ساعة الموعد النهائي للإقفال (مثال 14:00 للثانية ظهراً):
                  </label>
                  <input
                    type="time"
                    value={settings.editingDeadline || '14:00'}
                    onChange={e => updateSetting('editingDeadline', e.target.value)}
                    className="w-full h-11 px-3 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white font-mono"
                  />
                  <span className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 block font-semibold">
                    ⚠️ الموعد المحدد حالياً: {settings.editingDeadline || '14:00'}. بعد هذا الوقت يُمنع المعلمون من تعديل الحضور.
                  </span>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 flex flex-col justify-center space-y-1">
                  <span className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>صلاحيات الاستثناء للمدير:</span>
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    حتى بعد قفل الموعد النهائي، يمتلك مدير المدرسة فقط الصلاحية الدائمة لفتح وتعديل أي كشف غياب في أي وقت.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* School Name Config & Push Notifications Master */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* School Name */}
            <div className="p-5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <School className="w-4 h-4 text-blue-600" />
                <span>اسم المدرسة المعتمد للتقارير والختم</span>
              </h4>
              <input
                type="text"
                value={settings.schoolName || 'مدرسة الملك حسين بن طلال الثانوية للبنين'}
                onChange={e => updateSetting('schoolName', e.target.value)}
                className="w-full h-11 px-3.5 bg-white dark:bg-neutral-900 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white"
              />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                يظهر هذا الاسم على كشوفات الطباعة وتصديرات Excel للوزارة.
              </span>
            </div>

            {/* Browser Push Master Toggle */}
            <div className="p-5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>تفعيل نظام التنبيهات المنبثقة للكمبيوتر والجوال</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  إرسال إشعارات منبثقة مباشرة للمستخدم عند قرع جرس بداية الحصة أو حالات الغياب المتكرر.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={requestNotificationPermission}
                  className="h-9 px-3.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  طلب إذن الإشعارات الآن
                </button>

                <button
                  type="button"
                  onClick={() => updateSetting('enablePushNotifications', !settings.enablePushNotifications)}
                  className="p-1 rounded-xl cursor-pointer"
                >
                  {settings.enablePushNotifications ? (
                    <div className="w-12 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                      <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                    </div>
                  ) : (
                    <div className="w-12 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                      <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: USERS & CREDENTIALS */}
      {activeSection === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-purple-50/70 dark:bg-purple-950/30 p-4 rounded-xl border border-purple-200 dark:border-purple-900/50">
            <div>
              <h3 className="text-base font-bold text-purple-950 dark:text-purple-200">
                إدارة حسابات الدخول وكلمات المرور للمعلمين
              </h3>
              <p className="text-xs text-purple-800 dark:text-purple-300/80 mt-0.5">
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

      {/* SECTION FOR SUBSTITUTE DELEGATION */}
      {activeSection === 'substitutes' && (
        <div className="space-y-4">
          <div className="bg-amber-50/90 p-4 sm:p-5 rounded-2xl border border-amber-300 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-black text-amber-950 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-800" />
                  <span>تكليف وتفويض المعلم البديل والمناوبة المدرسية</span>
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-1">
                  يمكنك كمدير المدرسة اختيار معلم مسجل أو كتابة اسم أي معلم بديل يدوياً لتغطية حصص المعلمين الغائبين، وسيحصل البديل فوراً على صلاحية رصد الحضور للحصة المحددة.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 text-xs font-bold text-amber-900 shrink-0">
                <span>الحصص المكلفة ببديل:</span>
                <span className="px-2 py-0.5 bg-amber-200 text-amber-950 rounded-md font-mono text-sm">
                  {timetable.filter(s => s.substituteTeacherName).length} حصة
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-amber-200">
              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">تصفية حسب اليوم:</label>
                <select
                  value={subFilterDay}
                  onChange={e => setSubFilterDay(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">جميع الأيام</option>
                  <option value="الأحد">الأحد</option>
                  <option value="الإثنين">الإثنين</option>
                  <option value="الثلاثاء">الثلاثاء</option>
                  <option value="الأربعاء">الأربعاء</option>
                  <option value="الخميس">الخميس</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">تصفية حسب الفصل:</label>
                <select
                  value={subFilterClass}
                  onChange={e => setSubFilterClass(e.target.value)}
                  className="w-full h-9 px-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <option value="all">جميع الفصول الدراسية</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-950 mb-1">بحث سريع:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={subSearch}
                    onChange={e => setSubSearch(e.target.value)}
                    placeholder="ابحث بالمعلم، المادة، أو الفصل..."
                    className="w-full h-9 pl-3 pr-8 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400"
                  />
                  <Search className="w-3.5 h-3.5 text-amber-700 absolute right-2.5 top-3" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {timetable
              .filter(slot => {
                if (subFilterDay !== 'all' && slot.day !== subFilterDay) return false;
                if (subFilterClass !== 'all' && slot.classId !== subFilterClass) return false;
                if (subSearch.trim()) {
                  const q = subSearch.toLowerCase();
                  const matchSubj = slot.subject.toLowerCase().includes(q);
                  const matchClass = slot.className.toLowerCase().includes(q);
                  const matchTeach = (slot.teacherName || '').toLowerCase().includes(q);
                  const matchSubTeach = (slot.substituteTeacherName || '').toLowerCase().includes(q);
                  if (!matchSubj && !matchClass && !matchTeach && !matchSubTeach) return false;
                }
                return true;
              })
              .map(slot => (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-2xl border text-xs flex flex-col justify-between gap-3 shadow-2xs transition ${
                    slot.substituteTeacherName
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md text-[11px]">
                        {slot.className}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {slot.day} • الحصة {slot.periodNumber}
                      </span>
                    </div>

                    <div className="text-slate-900 font-extrabold text-sm">
                      {slot.subject}
                    </div>

                    <div className="text-slate-600 text-[11px] flex items-center justify-between">
                      <span>المعلم الأساسي:</span>
                      <strong className="text-slate-800">{slot.teacherName || 'غير محدد'}</strong>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      {slot.substituteTeacherName ? (
                        <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-800 block">
                              ✓ المعلم البديل المعتمد:
                            </span>
                            <span className="font-extrabold text-emerald-950 text-xs">
                              {slot.substituteTeacherName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              updateTimetableSlot(slot.id, {
                                substituteTeacherId: undefined,
                                substituteTeacherName: undefined,
                              });
                            }}
                            title="إلغاء تكليف البديل"
                            className="p-1 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-400 italic">
                          لا يوجد معلم بديل (الحصة للمعلّم الأساسي)
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubSlot(slot);
                      setSubNameInput(slot.substituteTeacherName || '');
                      setSubSelectUserId(slot.substituteTeacherId || '');
                    }}
                    className={`w-full h-8 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      slot.substituteTeacherName
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{slot.substituteTeacherName ? 'تعديل اسم المعلم البديل' : '+ تكليف معلم بديل للحصة'}</span>
                  </button>
                </div>
              ))}
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
              يمكن لمدير المدرسة تغيير موعد بداية ونهاية كل حصة وتحديد نافذة وقت رصد الحضور.
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
                      خلال أول {timing.windowMinutes} دقيقة
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
                    grade: 'الصف التاسع (9th)',
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
                    classId: classes[0]?.id || 'class-9th',
                    seatNumber: students.length + 1,
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
                      title="تعديل بيانات الفصل"
                      onClick={() => {
                        setEditingClassId(c.id);
                        setClassForm({
                          name: c.name,
                          grade: c.gradeLevel || 'الصف الدراسي',
                          room: c.room || 'قاعة 101',
                          floor: 'الدور الأرضي',
                        });
                        setShowClassModal(true);
                      }}
                      className="h-7 w-7 text-amber-600 hover:bg-amber-50 rounded-lg flex items-center justify-center transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      title="حذف الفصل"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف فصل (${c.name}) نهائياً من المدرسة؟`)) {
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
                <AssignedClassesSelector
                  assignedClasses={userForm.assignedClasses}
                  onChange={newClasses => setUserForm(prev => ({ ...prev, assignedClasses: newClasses }))}
                  teacherName={userForm.name}
                />
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
                  value={editingTiming.windowMinutes}
                  onChange={e =>
                    setEditingTiming(prev =>
                      prev ? { ...prev, windowMinutes: Number(e.target.value) } : null
                    )
                  }
                  required
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden font-bold"
                />
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
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className={`p-4 flex items-center justify-between text-white ${
              editingClassId ? 'bg-amber-600' : 'bg-emerald-900'
            }`}>
              <div className="flex items-center gap-2">
                <School className="w-5 h-5" />
                <h3 className="font-bold text-base">
                  {editingClassId ? 'تعديل بيانات الفصل الدراسي' : 'إضافة فصل دراسي جديد'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowClassModal(false);
                  setEditingClassId(null);
                }}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const trimmedName = classForm.name.trim();
                if (!trimmedName) return;

                if (editingClassId) {
                  updateClass(editingClassId, {
                    name: trimmedName,
                    gradeLevel: classForm.grade,
                    room: classForm.room,
                  });
                } else {
                  addClass({
                    name: trimmedName,
                    gradeLevel: classForm.grade,
                    room: classForm.room,
                    homeroomTeacher: 'غير محدد',
                    studentCount: 0,
                  });
                }
                setShowClassModal(false);
                setEditingClassId(null);
              }}
              className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم الفصل والشعبة المحدد:
                </label>
                <input
                  type="text"
                  value={classForm.name}
                  onChange={e => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="مثال: الصف الثامن (أ)"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-bold text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">القاعة / الغرفة الدراسية:</label>
                <input
                  type="text"
                  value={classForm.room}
                  onChange={e => setClassForm(prev => ({ ...prev, room: e.target.value }))}
                  placeholder="قاعة 103"
                  className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium text-xs focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowClassModal(false);
                    setEditingClassId(null);
                  }}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`h-9 px-5 text-white rounded-xl font-bold cursor-pointer shadow-xs ${
                    editingClassId
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  {editingClassId ? 'تحديث الفصل' : 'حفظ الفصل'}
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
                  guardianPhone: studentForm.guardianPhone,
                  avatarSeed: studentForm.name.split(' ')[0] || 'st',
                  parentName: `ولي أمر ${studentForm.name.split(' ')[0]}`,
                  parentPhone: studentForm.guardianPhone,
                  consecutiveAbsences: 0,
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

      {/* SUBSTITUTE TEACHER ASSIGNMENT MODAL */}
      {editingSubSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    تكليف وتعيين معلم بديل
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingSubSlot.className} • {editingSubSlot.day} (الحصة {editingSubSlot.periodNumber})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSubSlot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">المادة الدراسية:</span>
                <span className="font-bold text-slate-900">{editingSubSlot.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">المعلم الأساسي للحصة:</span>
                <span className="font-bold text-slate-900">{editingSubSlot.teacherName || 'غير محدد'}</span>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  1. اختيار من قائمة المعلمين المسجلين بالمدرسة:
                </label>
                <select
                  value={subSelectUserId}
                  onChange={e => {
                    const selId = e.target.value;
                    setSubSelectUserId(selId);
                    if (selId) {
                      const found = users.find(u => u.id === selId || u.teacherId === selId);
                      if (found) {
                        setSubNameInput(found.name);
                      }
                    }
                  }}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="">-- اختر معلماً من القائمة لتعبئة الاسم تلقائياً --</option>
                  {users
                    .filter(u => u.role === 'teacher')
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.subject || 'معلم'})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  2. أو كتابة اسم المعلم البديل يدويًا:
                </label>
                <input
                  type="text"
                  value={subNameInput}
                  onChange={e => setSubNameInput(e.target.value)}
                  placeholder="اكتب اسم المعلم البديل هنا..."
                  className="w-full h-10 px-3 bg-white border border-amber-300 focus:border-amber-500 ring-1 ring-amber-100 rounded-xl font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-slate-100">
              {editingSubSlot.substituteTeacherName ? (
                <button
                  type="button"
                  onClick={() => {
                    updateTimetableSlot(editingSubSlot.id, {
                      substituteTeacherId: undefined,
                      substituteTeacherName: undefined,
                    });
                    setEditingSubSlot(null);
                  }}
                  className="w-full sm:w-auto h-9 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs cursor-pointer border border-red-200 transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>إلغاء التكليف الحالي</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setEditingSubSlot(null)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const finalName = subNameInput.trim();
                    if (!finalName) return;
                    const matched = users.find(
                      u => u.id === subSelectUserId || u.name === finalName
                    );
                    updateTimetableSlot(editingSubSlot.id, {
                      substituteTeacherId: matched ? matched.id : `sub-${Date.now()}`,
                      substituteTeacherName: finalName,
                    });
                    setEditingSubSlot(null);
                  }}
                  disabled={!subNameInput.trim()}
                  className="h-9 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>اعتماد وحفظ المعلم البديل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
