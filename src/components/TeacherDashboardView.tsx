/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { TimetableSlot, AttendanceStatus, Student } from '../types';
import { StudentManagementModal, StudentModalMode } from './StudentManagementModal';
import {
  Clock,
  BookOpen,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Users,
  MapPin,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Phone,
  X,
  UserPlus,
  MessageCircle,
} from 'lucide-react';

export const TeacherDashboardView: React.FC = () => {
  const {
    currentUser,
    currentTeacherSlot,
    allAssignedTeacherSlots,
    timetable,
    addTimetableSlot,
    updateTimetableSlot,
    deleteTimetableSlot,
    classes,
    students,
    currentRecords,
    setSelectedClassId,
    setSelectedPeriod,
    setActiveTab,
    canUserEditAttendance,
    currentDate,
  } = useAttendance();

  // Schedule slot modal state
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({
    day: 'الأحد' as 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس',
    periodNumber: 1,
    timeRange: '08:00 - 08:45 ص',
    subject: currentUser?.subject || 'لغتي الجميلة',
    classId: classes[0]?.id || 'class-1a',
    room: 'قاعة 101',
  });

  // Student management modal state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState<StudentModalMode>('add');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  const [selectedStudentFilterClass, setSelectedStudentFilterClass] = useState<string>(
    currentUser?.assignedClasses?.[0] || classes[0]?.id || 'class-1a'
  );

  // Filter students for the teacher's selected group
  const groupStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedStudentFilterClass);
  }, [students, selectedStudentFilterClass]);

  // Today's day name in Arabic
  const todayArabic = useMemo(() => {
    const days: Array<'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = [
      'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'
    ];
    const jsDay = new Date().getDay();
    return jsDay >= 0 && jsDay <= 4 ? days[jsDay] : 'الأحد';
  }, []);

  // Today's slots for this teacher
  const todayTeacherSlots = useMemo(() => {
    return allAssignedTeacherSlots.filter(s => s.day === todayArabic);
  }, [allAssignedTeacherSlots, todayArabic]);

  // Open slot modal for adding
  const handleOpenAddSlot = () => {
    setEditingSlotId(null);
    setSlotForm({
      day: todayArabic,
      periodNumber: 1,
      timeRange: '08:00 - 08:45 ص',
      subject: currentUser?.subject || 'لغتي الجميلة',
      classId: selectedStudentFilterClass,
      room: 'قاعة 101',
    });
    setShowSlotModal(true);
  };

  // Open slot modal for editing
  const handleOpenEditSlot = (slot: TimetableSlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      day: slot.day,
      periodNumber: slot.periodNumber,
      timeRange: slot.timeRange,
      subject: slot.subject,
      classId: slot.classId,
      room: slot.room,
    });
    setShowSlotModal(true);
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === slotForm.classId);
    const className = targetClass?.name || 'فصل غير محدد';

    if (editingSlotId) {
      updateTimetableSlot(editingSlotId, {
        day: slotForm.day,
        periodNumber: Number(slotForm.periodNumber),
        timeRange: slotForm.timeRange,
        subject: slotForm.subject,
        classId: slotForm.classId,
        className,
        room: slotForm.room,
      });
    } else {
      addTimetableSlot({
        day: slotForm.day,
        periodNumber: Number(slotForm.periodNumber),
        timeRange: slotForm.timeRange,
        subject: slotForm.subject,
        classId: slotForm.classId,
        className,
        room: slotForm.room,
        teacherId: currentUser?.teacherId || currentUser?.id,
        teacherName: currentUser?.name || 'أ. المعلم',
      });
    }
    setShowSlotModal(false);
  };

  const handleJumpToTakeAttendance = (classId: string, periodNumber: number) => {
    setSelectedClassId(classId);
    setSelectedPeriod(periodNumber);
    setActiveTab('take_attendance');
  };

  return (
    <div className="space-y-5">
      {/* 1. HERO WIDGET: أين يجب أن أكون الآن؟ */}
      <div className="bg-gradient-to-l from-blue-900 to-indigo-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-blue-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-xs rounded-full text-xs font-bold text-emerald-300 border border-white/20 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>أين يجب أن أكون الآن؟ (التتبع المباشر للحصة)</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">
              أهلاً بك، {currentUser?.name}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl opacity-90">
              يمكنك متابعة جدولك الدراسي المعتمد، رصد الحضور لمجموعتك من الطلاب، وتعديل جدول حصصك.
            </p>
          </div>

          {/* Current Slot Info or Idle Status */}
          {currentTeacherSlot ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-emerald-300 font-bold block">
                  الحصة الجارية الآن • الحصة {currentTeacherSlot.periodNumber}
                </span>
                <p className="text-lg font-black text-white">{currentTeacherSlot.className}</p>
                <div className="flex items-center gap-3 text-xs text-blue-200 mt-0.5">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{currentTeacherSlot.subject}</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentTeacherSlot.room}</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-take-current-slot-attendance"
                onClick={() =>
                  handleJumpToTakeAttendance(
                    currentTeacherSlot.classId,
                    currentTeacherSlot.periodNumber
                  )
                }
                className="h-11 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition shadow-md flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>رصد الحضور الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          ) : todayTeacherSlots.length > 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-amber-300 font-bold block">
                  الحصة القادمة لك اليوم ({todayArabic})
                </span>
                <p className="text-base font-bold text-white">
                  {todayTeacherSlots[0].className} — الحصة {todayTeacherSlots[0].periodNumber}
                </p>
                <p className="text-xs text-blue-200 font-mono mt-0.5">
                  {todayTeacherSlots[0].subject} • {todayTeacherSlots[0].timeRange}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleJumpToTakeAttendance(
                    todayTeacherSlots[0].classId,
                    todayTeacherSlots[0].periodNumber
                  )
                }
                className="h-10 px-4 bg-white hover:bg-blue-50 text-blue-950 font-bold rounded-xl text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>فتح كشف الحصة</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-right">
              <span className="text-xs text-blue-200 font-bold block">
                لا توجد حصص مجدولة لك حالياً في هذا اليوم ({todayArabic}).
              </span>
              <p className="text-xs text-blue-100/70 mt-1">
                يمكنك إضافة حصص جديدة إلى جدولك الدراسي بالأسفل.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. TEACHER SCHEDULE MANAGEMENT (Add / Edit My Schedule) */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
                الجدول المدرسي للمعلم
              </span>
              <span className="text-xs text-slate-500 font-medium">
                إجمالي حصصك المسندة: {allAssignedTeacherSlots.length} حصة
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              حصصي المعتمدة مع إمكانية الإضافة والتعديل
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              يمكنك إضافة وتعديل حصصك في جدول المدرسة، والتحضير المباشر لكل حصة من حصصك.
            </p>
          </div>

          <button
            type="button"
            id="btn-teacher-add-slot"
            onClick={handleOpenAddSlot}
            className="h-9 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة حصة لجدولي</span>
          </button>
        </div>

        {allAssignedTeacherSlots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500">
            <Calendar className="w-10 h-10 mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-sm text-slate-700">لم يتم إسناد أي حصص لجدولك بعد</p>
            <p className="text-xs mt-1">اضغط على زر "إضافة حصة لجدولي" أعلاه لإدراج أول حصة لك.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allAssignedTeacherSlots.map(slot => {
              const auth = canUserEditAttendance(slot.classId, slot.periodNumber);
              return (
                <div
                  key={slot.id}
                  className="p-4 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded-md font-bold text-xs">
                        يوم {slot.day}
                      </span>
                      <span className="font-bold text-xs text-slate-700">
                        الحصة {slot.periodNumber}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{slot.timeRange}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{slot.className}</h4>
                    <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-blue-700" />
                        <span>{slot.subject}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-amber-600" />
                        <span>{slot.room}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleJumpToTakeAttendance(slot.classId, slot.periodNumber)}
                      className="flex-1 h-8 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>رصد الحضور</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditSlot(slot)}
                      title="تعديل الحصة"
                      className="h-8 w-8 bg-white hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف الحصة (${slot.subject} - ${slot.className})؟`)) {
                          deleteTimetableSlot(slot.id);
                        }
                      }}
                      title="حذف الحصة"
                      className="h-8 w-8 bg-white hover:bg-red-50 text-red-600 rounded-xl border border-slate-200 flex items-center justify-center transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. MY GROUP & ABSENT STUDENTS OVERVIEW */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full font-bold text-xs">
                مجموعتي وطلابي
              </span>
              <span className="text-xs text-slate-500 font-medium">متابعة دقيقة لحالة الحضور والغياب</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              قائمة طلاب المجموعة ومتابعة الغياب
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              يمكنك كمعلم متابعة من هم الطلاب الحاضرون والغائبون في مجموعتك والتعديل على حضورهم.
            </p>
          </div>

          {/* Controls: Add Student and Class selector */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-teacher-add-student"
              onClick={() => {
                setSelectedStudentForModal(null);
                setStudentModalMode('add');
                setIsStudentModalOpen(true);
              }}
              className="h-9 px-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>إضافة طالب</span>
            </button>

            <button
              type="button"
              id="btn-teacher-bulk-add"
              onClick={() => {
                setSelectedStudentForModal(null);
                setStudentModalMode('bulk_add');
                setIsStudentModalOpen(true);
              }}
              className="h-9 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 border border-slate-300 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-700" />
              <span className="hidden sm:inline">إضافة سريعة بالأسماء</span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">الفصل:</span>
              <select
                value={selectedStudentFilterClass}
                onChange={e => setSelectedStudentFilterClass(e.target.value)}
                className="h-9 px-3 bg-slate-100 text-slate-900 font-bold rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({students.filter(s => s.classId === c.id).length} طالب)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Student Cards in Teacher View */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3">#</th>
                <th className="p-3">اسم الطالب</th>
                <th className="p-3">رقم المقعد</th>
                <th className="p-3">هاتف ولي الأمر</th>
                <th className="p-3">حالة الحضور المسجلة</th>
                <th className="p-3 text-center">إجراءات الطالب</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {groupStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    لا يوجد طلاب مسجلون في هذا الفصل حالياً. اضغط على "إضافة طالب" بالأعلى لإضافتهم.
                  </td>
                </tr>
              ) : (
                groupStudents.map((student, idx) => {
                  const rec = currentRecords[student.id];
                  const status: AttendanceStatus = rec?.status || 'present';
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{student.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">هوية: {student.nationalId}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-900">
                        مقعد {student.seatNumber}
                      </td>
                      <td className="p-3 font-mono text-slate-600" dir="ltr">
                        {student.guardianPhone}
                      </td>
                      <td className="p-3">
                        {status === 'present' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>حاضر اليوم</span>
                          </span>
                        )}
                        {status === 'absent' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 text-red-900 border border-red-300 rounded-full font-bold text-xs">
                            <XCircle className="w-3.5 h-3.5 text-red-700" />
                            <span>غائب اليوم</span>
                          </span>
                        )}
                        {status === 'late' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>متأخر</span>
                          </span>
                        )}
                        {status === 'excused' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-300 rounded-full font-bold text-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-blue-700" />
                            <span>مستأذن بعذر</span>
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          {/* Contact Guardian / WhatsApp */}
                          <button
                            type="button"
                            id={`btn-contact-guardian-${student.id}`}
                            onClick={() => {
                              setSelectedStudentForModal(student);
                              setStudentModalMode('contact');
                              setIsStudentModalOpen(true);
                            }}
                            title="التواصل مع ولي الأمر والواتساب"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition cursor-pointer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Student */}
                          <button
                            type="button"
                            id={`btn-edit-student-${student.id}`}
                            onClick={() => {
                              setSelectedStudentForModal(student);
                              setStudentModalMode('edit');
                              setIsStudentModalOpen(true);
                            }}
                            title="تعديل بيانات الطالب"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-900 border border-slate-200 transition cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Student */}
                          <button
                            type="button"
                            id={`btn-delete-student-${student.id}`}
                            onClick={() => {
                              setSelectedStudentForModal(student);
                              setStudentModalMode('delete_confirm');
                              setIsStudentModalOpen(true);
                            }}
                            title="حذف الطالب من الفصل"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-700 border border-slate-200 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SLOT MODAL (Add / Edit Slot) */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-right">
            <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSlotId ? 'تعديل الحصة الدراسية' : 'إضافة حصة لجدولك'}
              </h3>
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-4 space-y-3 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اليوم:</label>
                <select
                  value={slotForm.day}
                  onChange={e =>
                    setSlotForm(prev => ({
                      ...prev,
                      day: e.target.value as 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس',
                    }))
                  }
                  className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                >
                  <option value="الأحد">الأحد</option>
                  <option value="الإثنين">الإثنين</option>
                  <option value="الثلاثاء">الثلاثاء</option>
                  <option value="الأربعاء">الأربعاء</option>
                  <option value="الخميس">الخميس</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الحصة:</label>
                  <select
                    value={slotForm.periodNumber}
                    onChange={e =>
                      setSlotForm(prev => ({ ...prev, periodNumber: Number(e.target.value) }))
                    }
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map(num => (
                      <option key={num} value={num}>
                        الحصة {num}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
                  <select
                    value={slotForm.classId}
                    onChange={e => setSlotForm(prev => ({ ...prev, classId: e.target.value }))}
                    className="w-full h-9 px-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المادة:</label>
                  <input
                    type="text"
                    value={slotForm.subject}
                    onChange={e => setSlotForm(prev => ({ ...prev, subject: e.target.value }))}
                    required
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">القاعة / الغرفة:</label>
                  <input
                    type="text"
                    value={slotForm.room}
                    onChange={e => setSlotForm(prev => ({ ...prev, room: e.target.value }))}
                    placeholder="قاعة 101"
                    className="w-full h-9 px-3 bg-slate-50 border border-slate-300 rounded-lg font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
                  className="h-9 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl font-bold cursor-pointer shadow-xs"
                >
                  حفظ الحصة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* STUDENT MANAGEMENT MODAL (Add / Edit / Contact / Delete Student) */}
      <StudentManagementModal
        isOpen={isStudentModalOpen}
        mode={studentModalMode}
        initialClassId={selectedStudentFilterClass}
        studentToEdit={selectedStudentForModal}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudentForModal(null);
        }}
      />
    </div>
  );
};
