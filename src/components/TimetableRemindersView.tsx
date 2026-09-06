/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TimetableSlot } from '../types';
import {
  Calendar,
  Clock,
  Sparkles,
  BookOpenCheck,
  Volume2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  UserCheck,
  Bell,
  CheckCircle2,
  X,
  AlertCircle,
  Filter,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { speakArabic } from '../utils/audio';

const QUICK_SUBJECTS = [
  'لغتي الجميلة',
  'الرياضيات',
  'العلوم',
  'الدراسات الإسلامية',
  'اللغة الإنجليزية',
  'المهارات الرقمية',
  'التربية البدنية',
  'التربية الفنية',
  'المهارات الحياتية',
  'التفكير الناقد',
];

export const TimetableRemindersView: React.FC = () => {
  const {
    timetable,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    periodTimings,
    classes,
    currentUser,
    setSelectedClassId,
    setSelectedPeriod,
    setActiveTab,
    triggerTestAlert,
    addNotification,
    notifications,
    dismissNotification,
  } = useAttendance();

  const days: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
  ];

  // Default day to today's school day
  const todayArabic = useMemo(() => {
    const daysArr: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'
    ];
    const jsDay = new Date().getDay();
    return jsDay >= 0 && jsDay <= 4 ? daysArr[jsDay] : 'الأحد';
  }, []);

  const [activeDay, setActiveDay] = useState<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'>(todayArabic);
  const [filterMyScheduleOnly, setFilterMyScheduleOnly] = useState<boolean>(
    currentUser?.role === 'teacher'
  );

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    day: todayArabic,
    periodNumber: 1,
    timeRange: '08:00 - 08:45 ص',
    subject: currentUser?.subject || 'الرياضيات',
    classId: classes[0]?.id || 'class-9th',
    room: 'قاعة 101',
    teacherId: currentUser?.teacherId || currentUser?.id || 't1',
    teacherName: currentUser?.name || 'أ. المعلم',
  });

  // Calculate slots filtered for the day & teacher preference
  const daySlots = useMemo(() => {
    let slots = timetable.filter(s => s.day === activeDay);

    if (filterMyScheduleOnly && currentUser) {
      if (currentUser.role === 'teacher') {
        slots = slots.filter(
          s =>
            s.teacherId === currentUser.teacherId ||
            s.teacherId === currentUser.id ||
            (currentUser.assignedClasses && currentUser.assignedClasses.includes(s.classId))
        );
      }
    }

    // Sort by period number ascending
    return slots.sort((a, b) => a.periodNumber - b.periodNumber);
  }, [timetable, activeDay, filterMyScheduleOnly, currentUser]);

  // When period number changes, sync timeRange automatically from periodTimings
  const handlePeriodChange = (num: number) => {
    const timing = periodTimings.find(pt => pt.periodNumber === num);
    const range = timing ? `${timing.startTime} - ${timing.endTime}` : `الحصة ${num}`;
    setFormState(prev => ({
      ...prev,
      periodNumber: num,
      timeRange: range,
    }));
  };

  const handleOpenAdd = () => {
    setEditingSlotId(null);
    const timing = periodTimings.find(pt => pt.periodNumber === 1);
    const range = timing ? `${timing.startTime} - ${timing.endTime}` : '08:00 - 08:45 ص';

    setFormState({
      day: activeDay,
      periodNumber: 1,
      timeRange: range,
      subject: currentUser?.subject || 'الرياضيات',
      classId: classes[0]?.id || 'class-9th',
      room: classes[0]?.room || 'قاعة 101',
      teacherId: currentUser?.teacherId || currentUser?.id || 't1',
      teacherName: currentUser?.name || 'أ. المعلم',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setFormState({
      day: slot.day,
      periodNumber: slot.periodNumber,
      timeRange: slot.timeRange,
      subject: slot.subject,
      classId: slot.classId,
      room: slot.room,
      teacherId: slot.teacherId || currentUser?.teacherId || currentUser?.id || 't1',
      teacherName: slot.teacherName || currentUser?.name || 'أ. المعلم',
    });
    setIsModalOpen(true);
  };

  const handleDeleteSlot = (id: string, subject: string, periodNumber: number) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف حصة (${subject} - الحصة ${periodNumber}) من جدول يوم ${activeDay}؟`)) {
      deleteTimetableSlot(id);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === formState.classId);
    const className = targetClass?.name || 'فصل غير محدد';

    if (editingSlotId) {
      updateTimetableSlot(editingSlotId, {
        day: formState.day,
        periodNumber: Number(formState.periodNumber),
        timeRange: formState.timeRange,
        subject: formState.subject.trim(),
        classId: formState.classId,
        className,
        room: formState.room.trim(),
        teacherId: formState.teacherId,
        teacherName: formState.teacherName,
      });
      addNotification(
        'تم تحديث الحصة في الجدول',
        `تم تعديل حصة (${formState.subject}) - الحصة ${formState.periodNumber} لفصل (${className}) بنجاح.`,
        'info',
        formState.classId
      );
    } else {
      addTimetableSlot({
        day: formState.day,
        periodNumber: Number(formState.periodNumber),
        timeRange: formState.timeRange,
        subject: formState.subject.trim(),
        classId: formState.classId,
        className,
        room: formState.room.trim(),
        teacherId: formState.teacherId,
        teacherName: formState.teacherName,
      });
      addNotification(
        'حصة جديدة في الجدول',
        `تمت إضافة حصة (${formState.subject}) - الحصة ${formState.periodNumber} لفصل (${className}) يوم ${formState.day}.`,
        'info',
        formState.classId
      );
    }

    setIsModalOpen(false);
  };

  const handleStartAttendanceForSlot = (classId: string, periodNumber: number) => {
    setSelectedClassId(classId);
    setSelectedPeriod(periodNumber);
    setActiveTab('take_attendance');
  };

  const handleSpeakDaySchedule = () => {
    const text = `جدول يوم ${activeDay}. عدد الحصص المجدولة ${daySlots.length} حصص. الحصة الأولى تبدأ في الساعة الثامنة صباحاً.`;
    speakArabic(text);
  };

  // Schedule notification triggers
  const triggerPeriodUpcomingAlert = (slot: TimetableSlot) => {
    addNotification(
      '🔔 تذكير ذكي: اقتراب موعد الحصة',
      `أ. ${slot.teacherName || currentUser?.name}: تبدأ حصة (${slot.subject}) لفصل (${slot.className}) في ${slot.room} بعد 5 دقائق!`,
      'reminder',
      slot.classId
    );
  };

  const triggerPeriodAttendanceDelayedAlert = (slot: TimetableSlot) => {
    addNotification(
      '⚠️ تذكير رصد الغياب: مضت 10 دقائق',
      `تنبيه رصد الحضور: مضت 10 دقائق على بداية الحصة ${slot.periodNumber} (${slot.subject} - ${slot.className}). يرجى اعتماد كشف الغياب الآن.`,
      'warning',
      slot.classId
    );
  };

  return (
    <div id="view-timetable-reminders" className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs">
              الجدول المدرسي والتنبيهات
            </span>
            {currentUser && (
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 rounded-full font-bold text-xs flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>{currentUser.name}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            إدارة وتعديل جدول الحصص والتذكيرات
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            يمكنك إضافة وتعديل الحصص المدرسية مع تحديد المادة، الفصل، رقم الحصة، والقاعة، واستقبال التنبيهات المباشرة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Slot Button */}
          <button
            id="btn-add-timetable-slot"
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة للجدول</span>
          </button>

          {/* Quick Smart Alert Button */}
          <button
            id="btn-trigger-smart-alert"
            type="button"
            onClick={() =>
              triggerTestAlert(
                classes[0]?.id || 'class-9th',
                '🔔 تنبيه ذكي: تبدأ الحصة القادمة بعد 5 دقائق. يرجى رصد الحضور.'
              )
            }
            className="h-10 px-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
            title="تجربة إرسال إشعار تذكير بالحصة القادمة"
          >
            <Bell className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">تنبيه تجريبي</span>
          </button>

          {/* Speak Audio */}
          <button
            type="button"
            onClick={handleSpeakDaySchedule}
            title="استماع لجدول اليوم صوتياً"
            className="h-10 w-10 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-xl border border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-300 flex items-center justify-center cursor-pointer transition"
          >
            <Volume2 className="w-4 h-4 text-blue-900 dark:text-blue-400" />
          </button>
        </div>
      </div>

      {/* Active Notifications & Reminders Alert Bar */}
      {notifications.length > 0 && (
        <div className="bg-slate-900 dark:bg-neutral-900 text-slate-100 rounded-2xl p-4 border border-slate-800 dark:border-neutral-800 shadow-md space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 dark:border-neutral-800 pb-2">
            <span className="text-xs sm:text-sm font-bold flex items-center gap-2 text-amber-400">
              <Bell className="w-4 h-4" />
              <span>إشعارات وتذكيرات الجدول النشطة ({notifications.length})</span>
            </span>
            <span className="text-[11px] text-slate-400">انقر للرصد أو الإغلاق</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
            {notifications.slice(0, 4).map(notif => (
              <div
                key={notif.id}
                className="p-3 bg-slate-800/80 dark:bg-neutral-950 rounded-xl border border-slate-700 dark:border-neutral-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        notif.type === 'warning'
                          ? 'bg-amber-400'
                          : notif.type === 'reminder'
                          ? 'bg-blue-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <span>{notif.title}</span>
                  </div>
                  <p className="text-slate-300 leading-snug">{notif.message}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  {notif.classId && (
                    <button
                      type="button"
                      onClick={() => handleStartAttendanceForSlot(notif.classId!, 1)}
                      className="h-7 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      رصد
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => dismissNotification(notif.id)}
                    className="h-7 w-7 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg flex items-center justify-center cursor-pointer"
                    title="إغلاق التنبيه"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Selector & Teacher Filter Row */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-3 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Days Tabs */}
          <div className="grid grid-cols-5 gap-1 flex-1">
            {days.map(day => (
              <button
                key={day}
                id={`day-tab-${day}`}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`h-10 py-1 px-2 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  activeDay === day
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 hidden sm:inline" />
                <span>{day}</span>
              </button>
            ))}
          </div>

          {/* Teacher vs School Filter Toggle */}
          {currentUser && (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl border border-slate-200 dark:border-neutral-800 self-end sm:self-auto flex-shrink-0">
              <button
                type="button"
                onClick={() => setFilterMyScheduleOnly(true)}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterMyScheduleOnly
                    ? 'bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                حصصي فقط ({currentUser.name})
              </button>
              <button
                type="button"
                onClick={() => setFilterMyScheduleOnly(false)}
                className={`h-8 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  !filterMyScheduleOnly
                    ? 'bg-white dark:bg-neutral-800 text-blue-900 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                جميع حصص المدرسة
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Periods Grid for Selected Day */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>حصص يوم {activeDay}</span>
            <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-semibold">
              {daySlots.length} حصة مجدولة
            </span>
          </h3>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة حصة جديدة لهذا اليوم</span>
          </button>
        </div>

        {daySlots.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-neutral-800 space-y-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-neutral-800 text-blue-700 dark:text-blue-400 rounded-2xl mx-auto flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                لا توجد حصص مجدولة ليوم {activeDay} {filterMyScheduleOnly ? 'لحسابك' : ''}.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يمكنك إضافة حصص جديدة مع تحديد المادة والفصل ورقم الحصة بنقرة زر.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAdd}
              className="h-10 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة أول حصة الآن</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {daySlots.map(slot => {
              const isAssignedToMe =
                currentUser?.role === 'manager' ||
                slot.teacherId === currentUser?.teacherId ||
                slot.teacherId === currentUser?.id ||
                (currentUser?.assignedClasses && currentUser.assignedClasses.includes(slot.classId));

              return (
                <div
                  key={slot.id}
                  id={`slot-card-${slot.id}`}
                  className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-xs transition flex flex-col justify-between gap-3 relative group"
                >
                  {/* Card Header: Period Badge, Time Range & Quick Actions */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-black text-xs">
                          الحصة {slot.periodNumber}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono font-semibold">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {slot.timeRange}
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          id={`btn-edit-slot-${slot.id}`}
                          onClick={() => handleOpenEdit(slot)}
                          className="w-7 h-7 bg-slate-100 dark:bg-neutral-800 hover:bg-blue-50 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg flex items-center justify-center transition cursor-pointer"
                          title="تعديل الحصة"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          id={`btn-delete-slot-${slot.id}`}
                          onClick={() => handleDeleteSlot(slot.id, slot.subject, slot.periodNumber)}
                          className="w-7 h-7 bg-slate-100 dark:bg-neutral-800 hover:bg-red-50 dark:hover:bg-red-950/50 text-slate-600 dark:text-slate-300 hover:text-red-700 dark:hover:text-red-400 rounded-lg flex items-center justify-center transition cursor-pointer"
                          title="حذف الحصة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Name (المادة) */}
                    <div className="mt-1">
                      <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{slot.subject}</span>
                      </h4>
                    </div>

                    {/* Class Name (الفصل) & Room & Teacher */}
                    <div className="space-y-1 mt-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-md font-bold">
                          الفصل: {slot.className}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{slot.room}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-neutral-800">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>المعلم: {slot.teacherName || 'غير مسند'}</span>
                        </span>
                        {isAssignedToMe && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            ✓ حصتك المعتمدة
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Notifications Simulation & Take Attendance Button */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                    {/* Schedule Quick Reminders */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => triggerPeriodUpcomingAlert(slot)}
                        className="py-1 px-2 bg-slate-50 dark:bg-neutral-950 hover:bg-blue-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-blue-800 dark:hover:text-blue-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-neutral-800 transition cursor-pointer flex items-center justify-center gap-1"
                        title="تفعيل تذكير قبل الحصة بـ 5 دقائق"
                      >
                        <Bell className="w-3 h-3 text-amber-500" />
                        <span>تذكير (قبل 5 د)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerPeriodAttendanceDelayedAlert(slot)}
                        className="py-1 px-2 bg-slate-50 dark:bg-neutral-950 hover:bg-amber-50 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-amber-800 dark:hover:text-amber-300 rounded-lg text-[10px] font-bold border border-slate-200 dark:border-neutral-800 transition cursor-pointer flex items-center justify-center gap-1"
                        title="تفعيل تذكير بعد 10 دقائق من بدء الحصة"
                      >
                        <Clock className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>تذكير رصد الغياب</span>
                      </button>
                    </div>

                    {/* Direct Take Attendance Action Button */}
                    <button
                      type="button"
                      id={`btn-attend-slot-${slot.id}`}
                      onClick={() => handleStartAttendanceForSlot(slot.classId, slot.periodNumber)}
                      className={`w-full h-10 px-3 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer active:scale-98 ${
                        isAssignedToMe
                          ? 'bg-blue-900 hover:bg-blue-800 text-white'
                          : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <BookOpenCheck className="w-4 h-4 text-emerald-400" />
                      <span>{isAssignedToMe ? 'تسجيل حضور الحصة الآن' : 'عرض كشف الحصة'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Adding / Editing a Timetable Slot */}
      {isModalOpen && (
        <div
          id="modal-timetable-slot"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-neutral-800 space-y-4 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {editingSlotId ? 'تعديل بيانات الحصة' : 'إضافة حصة جديدة إلى الجدول'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    حدد المادة، الفصل، رقم الحصة، واليوم ليتعرف التطبيق على كل التفاصيل.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveForm} className="space-y-3.5 text-right">
              {/* 1. المادة (Subject) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. المادة الدراسية (ماده):
                </label>
                <input
                  type="text"
                  value={formState.subject}
                  onChange={e => setFormState({ ...formState, subject: e.target.value })}
                  placeholder="مثال: الرياضيات، لغتي، العلوم..."
                  required
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 text-sm"
                />

                {/* Quick Subject Suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {QUICK_SUBJECTS.map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setFormState({ ...formState, subject: subj })}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                        formState.subject === subj
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. الفصل (Which Class) & اليوم (Day) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    2. الفصل الدراسي (Which Class):
                  </label>
                  <select
                    value={formState.classId}
                    onChange={e => {
                      const sel = classes.find(c => c.id === e.target.value);
                      setFormState({
                        ...formState,
                        classId: e.target.value,
                        room: sel?.room || formState.room,
                      });
                    }}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 text-sm cursor-pointer"
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.gradeLevel}) - {cls.room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اليوم:
                  </label>
                  <select
                    value={formState.day}
                    onChange={e =>
                      setFormState({
                        ...formState,
                        day: e.target.value as 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس',
                      })
                    }
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 text-sm cursor-pointer"
                  >
                    {days.map(d => (
                      <option key={d} value={d}>
                        يوم {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3. رقم الحصة (Which Period) & التوقيت */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  3. رقم الحصة (Which Period):
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(p => {
                    const isSelected = formState.periodNumber === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handlePeriodChange(p)}
                        className={`h-10 rounded-xl font-black text-xs flex flex-col items-center justify-center transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-900 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span>ح {p}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-neutral-950 p-2 rounded-lg border border-slate-200 dark:border-neutral-800">
                  <span>توقيت الحصة المعتمد:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">{formState.timeRange}</span>
                </div>
              </div>

              {/* 4. القاعة & المعلم */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    القاعة / الموقع:
                  </label>
                  <input
                    type="text"
                    value={formState.room}
                    onChange={e => setFormState({ ...formState, room: e.target.value })}
                    placeholder="مثال: قاعة 101 أو معمل العلوم"
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    المعلم المسؤول:
                  </label>
                  <input
                    type="text"
                    value={formState.teacherName}
                    onChange={e => setFormState({ ...formState, teacherName: e.target.value })}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 text-sm"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="h-10 px-4 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="btn-save-timetable-slot"
                  className="h-10 px-5 bg-blue-900 hover:bg-blue-800 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{editingSlotId ? 'حفظ التعديلات' : 'إضافة الحصة للجدول'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
