/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import { StudentCard } from './StudentCard';
import { ConfirmationModal } from './ConfirmationModal';
import { StudentManagementModal, StudentModalMode } from './StudentManagementModal';
import { AttendanceStatus, Student } from '../types';
import {
  CheckCheck,
  RotateCcw,
  Search,
  CheckCircle,
  Save,
  Clock,
  ChevronDown,
  Volume2,
  X,
  ShieldAlert,
  Phone,
  Users,
  ArrowLeft,
  ChevronUp,
  UserPlus,
  Printer,
  Sparkles,
} from 'lucide-react';
import { speakArabic } from '../utils/audio';

export const TakeAttendanceView: React.FC = () => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    selectedPeriod,
    setSelectedPeriod,
    currentDate,
    setCurrentDate,
    activeClass,
    activeStudents,
    currentRecords,
    isCurrentSessionSubmitted,
    currentSessionMeta,
    setStudentStatus,
    markAllPresent,
    resetAttendanceSession,
    submitAttendanceSession,
    reopenAttendanceSession,
    settings,
    fastLoadMode,
    quickAddStudentNote,
    currentUser,
    canUserEditAttendance,
    currentTeacherSlot,
    timetable,
    periodTimings,
    submittedSessions,
    isSessionSubmitted,
    getSessionMeta,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [justSubmittedBanner, setJustSubmittedBanner] = useState(false);
  const [dismissedSessions, setDismissedSessions] = useState<Record<string, boolean>>({});
  const [showAbsentStudentsDrawer, setShowAbsentStudentsDrawer] = useState(false);

  // Student management modal state for teacher
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [studentModalMode, setStudentModalMode] = useState<StudentModalMode>('add');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  const authCheck = canUserEditAttendance(selectedClassId, selectedPeriod);
  const isSessionLocked = settings.emergencyLockdown || !authCheck.allowed || isCurrentSessionSubmitted;

  const currentSessionKey = `${selectedClassId}_${currentDate}_p${selectedPeriod}`;
  const isDismissed = !!dismissedSessions[currentSessionKey];

  // The bar is only shown when the session is NOT submitted, NOT manually dismissed, and user has permission to edit
  const shouldShowSubmitBar = !isCurrentSessionSubmitted && !isDismissed && authCheck.allowed;

  // Day name for timetable lookup
  const currentDayName = useMemo(() => {
    const daysMap: Record<number, 'الأحد' | 'الإثنين' | 'الثلاثاء' | 'الأربعاء' | 'الخميس'> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
    };
    const jsDay = new Date().getDay();
    return daysMap[jsDay] || 'الأحد';
  }, []);

  // Timetable slot for the currently selected class and period
  const currentPeriodSlot = useMemo(() => {
    return timetable.find(
      s => s.day === currentDayName && s.classId === selectedClassId && s.periodNumber === selectedPeriod
    );
  }, [timetable, currentDayName, selectedClassId, selectedPeriod]);

  const currentPeriodTiming = useMemo(() => {
    return periodTimings.find(t => t.periodNumber === selectedPeriod);
  }, [periodTimings, selectedPeriod]);

  // Check if current user (teacher) has a scheduled slot in this class today
  const teacherScheduledSlotInThisClass = useMemo(() => {
    if (currentUser?.role !== 'teacher') return null;
    return timetable.find(
      s =>
        s.day === currentDayName &&
        s.classId === selectedClassId &&
        (s.teacherId === currentUser.teacherId ||
          s.teacherId === currentUser.id ||
          s.substituteTeacherId === currentUser.id ||
          s.substituteTeacherId === currentUser.teacherId ||
          (s.substituteTeacherName &&
            (s.substituteTeacherName === currentUser.name ||
              currentUser.name.includes(s.substituteTeacherName) ||
              s.substituteTeacherName.includes(currentUser.name))))
    );
  }, [currentUser, currentDayName, selectedClassId, timetable]);

  // Is teacher viewing a period other than their scheduled slot in this class?
  const isViewingDifferentPeriodThanAssigned =
    currentUser?.role === 'teacher' &&
    teacherScheduledSlotInThisClass &&
    teacherScheduledSlotInThisClass.periodNumber !== selectedPeriod;

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return activeStudents.filter(student => {
      const matchesSearch =
        student.name.includes(searchQuery) ||
        student.seatNumber.toString().includes(searchQuery);

      if (!matchesSearch) return false;

      if (filterStatus === 'all') return true;

      const current = currentRecords[student.id]?.status || 'present';
      return current === filterStatus;
    });
  }, [activeStudents, searchQuery, filterStatus, currentRecords]);

  // List of absent students specifically for quick review
  const absentStudentsList = useMemo(() => {
    return activeStudents.filter(st => {
      const status = currentRecords[st.id]?.status || 'present';
      return status === 'absent';
    });
  }, [activeStudents, currentRecords]);

  // List of present students specifically
  const presentStudentsList = useMemo(() => {
    return activeStudents.filter(st => {
      const status = currentRecords[st.id]?.status || 'present';
      return status === 'present';
    });
  }, [activeStudents, currentRecords]);

  // Live Statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    activeStudents.forEach(st => {
      const record = currentRecords[st.id];
      const status = record?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    return {
      total: activeStudents.length,
      present,
      absent,
      late,
      excused,
    };
  }, [activeStudents, currentRecords]);

  const handleConfirmSubmit = () => {
    submitAttendanceSession();
    setShowConfirmModal(false);
    setDismissedSessions(prev => ({ ...prev, [currentSessionKey]: true }));
    setJustSubmittedBanner(true);
    setTimeout(() => {
      setJustSubmittedBanner(false);
    }, 6000);
  };

  const handleDismissBar = () => {
    setDismissedSessions(prev => ({ ...prev, [currentSessionKey]: true }));
  };

  const handleSpeakStats = () => {
    speakArabic(
      `كشف حضور ${activeClass.name}. إجمالي الطلاب ${stats.total}. الحضور ${stats.present}. الغياب ${stats.absent}. المتأخرون ${stats.late}.`
    );
  };

  return (
    <div id="view-take-attendance" className="space-y-4">
      {/* Session Header Card: Class selector, Period, and Date */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-neutral-800">
          {/* Class Title & Homeroom Teacher */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 rounded-full font-bold text-xs">
                تسجيل الحضور بالاستثناء
              </span>
              {isCurrentSessionSubmitted ? (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 rounded-full font-bold text-xs border border-emerald-300 dark:border-emerald-800/60">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>
                      معتمد ومحفوظ ({currentSessionMeta?.submittedAt || ''})
                      {currentSessionMeta?.submittedTeacherName ? ` • ${currentSessionMeta.submittedTeacherName}` : ''}
                    </span>
                  </span>
                  {(currentUser?.role === 'manager' || authCheck.allowed) && (
                    <button
                      id="btn-reopen-submit-from-header"
                      type="button"
                      onClick={() => {
                        reopenAttendanceSession();
                        setDismissedSessions(prev => ({ ...prev, [currentSessionKey]: false }));
                      }}
                      className="h-7 px-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-lg transition shadow-2xs cursor-pointer flex items-center gap-1"
                      title="إعادة فتح الكشف والتعديل وإعادة الحفظ"
                    >
                      <RotateCcw className="w-3 h-3 text-emerald-400" />
                      <span>إعادة فتح الكشف للتعديل</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded-full font-bold text-xs border border-amber-300 dark:border-amber-800/60">
                    <Clock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                    <span>بانتظار الاعتماد</span>
                  </span>
                  <button
                    id="btn-header-submit-session"
                    type="button"
                    disabled={isSessionLocked}
                    onClick={() => setShowConfirmModal(true)}
                    className="h-7 px-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>اعتماد الكشف</span>
                  </button>
                </div>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {activeClass.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              {activeClass.gradeLevel} • رائد الفصل: {activeClass.homeroomTeacher} • {activeClass.room}
            </p>
          </div>

          {/* Selectors: Class, Period, Date */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class Dropdown */}
            <div className="flex-1 sm:flex-initial">
              <label htmlFor="select-class" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                الفصل الدراسي:
              </label>
              <div className="relative">
                <select
                  id="select-class"
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="w-full sm:w-auto h-10 pl-8 pr-3 bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-900 dark:text-white font-semibold text-sm rounded-xl border border-slate-200 dark:border-neutral-800 focus:border-blue-700 focus:outline-hidden appearance-none cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} طالب)
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Period Selector */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="select-period" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                  الحصة:
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  (✓ = معتمدة)
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-900 p-0.5 rounded-xl border border-slate-200 dark:border-neutral-800">
                {[1, 2, 3, 4, 5].map(p => {
                  const pSubmitted = isSessionSubmitted(selectedClassId, p, currentDate);
                  const pSlot = timetable.find(
                    s => s.day === currentDayName && s.classId === selectedClassId && s.periodNumber === p
                  );
                  const isPMySlot =
                    currentUser?.role === 'teacher' &&
                    pSlot &&
                    (pSlot.teacherId === currentUser.teacherId ||
                      pSlot.teacherId === currentUser.id ||
                      pSlot.substituteTeacherId === currentUser.id ||
                      pSlot.substituteTeacherId === currentUser.teacherId ||
                      (pSlot.substituteTeacherName &&
                        (pSlot.substituteTeacherName === currentUser.name ||
                          currentUser.name.includes(pSlot.substituteTeacherName) ||
                          pSlot.substituteTeacherName.includes(currentUser.name))));

                  return (
                    <button
                      key={p}
                      id={`period-btn-${p}`}
                      type="button"
                      onClick={() => setSelectedPeriod(p)}
                      title={`الحصة ${p}${pSlot ? `: ${pSlot.subject} (${pSlot.teacherName})` : ''} - ${pSubmitted ? 'معتمدة ومحفوظة ✓' : 'بانتظار الاعتماد'}`}
                      className={`relative min-w-[38px] h-9 px-2 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                        selectedPeriod === p
                          ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                          : isPMySlot
                          ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700/70 hover:bg-amber-200'
                          : pSubmitted
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span>{p}</span>
                      {pSubmitted && (
                        <CheckCircle
                          className={`w-3 h-3 ${
                            selectedPeriod === p ? 'text-emerald-300' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        />
                      )}
                      {isPMySlot && (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded font-black ${
                            selectedPeriod === p
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-amber-500 text-white'
                          }`}
                        >
                          حصتك
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <label htmlFor="input-date" className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                التاريخ:
              </label>
              <div className="relative">
                <input
                  id="input-date"
                  type="date"
                  value={currentDate}
                  onChange={e => setCurrentDate(e.target.value)}
                  className="h-10 px-3 bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-neutral-800 focus:border-blue-700 focus:outline-hidden cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active Period & Timetable Info Strip */}
        <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/70 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 font-bold">
                الحصة {selectedPeriod}
              </span>
              <span className="text-blue-900 dark:text-blue-400 font-bold mr-1">
                {currentPeriodSlot?.subject || 'مادة دراسية'}
              </span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 dark:text-slate-400">
              المعلم: <strong className="text-slate-800 dark:text-slate-200">{currentPeriodSlot?.teacherName || 'غير مسند'}</strong>
            </span>
            {currentPeriodTiming && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 dark:text-slate-400 font-mono">
                  {currentPeriodTiming.startTime} - {currentPeriodTiming.endTime}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isCurrentSessionSubmitted ? (
              <span className="inline-flex items-center gap-1 text-emerald-800 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  معتمد ومحفوظ {currentSessionMeta?.submittedAt ? `(${currentSessionMeta.submittedAt})` : ''}
                  {currentSessionMeta?.submittedTeacherName ? ` • ${currentSessionMeta.submittedTeacherName}` : ''}
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>هذه الحصة بانتظار الاعتماد</span>
              </span>
            )}
          </div>
        </div>

        {/* Notice for Teacher if viewing another period */}
        {isViewingDifferentPeriodThanAssigned && teacherScheduledSlotInThisClass && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-blue-950 dark:text-blue-200">
              <span className="p-1 bg-blue-100 dark:bg-blue-900/60 rounded-md">💡</span>
              <span>
                أنت تستعرض <strong>الحصة {selectedPeriod}</strong> ({isCurrentSessionSubmitted ? 'معتمدة' : 'غير معتمدة'}). حصتك المجدولة في هذا الفصل اليوم هي <strong>الحصة {teacherScheduledSlotInThisClass.periodNumber} ({teacherScheduledSlotInThisClass.subject})</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPeriod(teacherScheduledSlotInThisClass.periodNumber)}
              className="h-7 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <span>الانتقال لحصتي (الحصة {teacherScheduledSlotInThisClass.periodNumber})</span>
            </button>
          </div>
        )}

        {/* Attendance Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-4">
          {/* Total */}
          <div className="bg-slate-50 dark:bg-[#121215] rounded-xl p-3 border border-slate-200 dark:border-neutral-800 text-center transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">إجمالي الطلاب</span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 block">{stats.total}</span>
          </div>

          {/* Present */}
          <div className="bg-slate-50 dark:bg-[#121215] rounded-xl p-3 border border-slate-200 dark:border-neutral-800 text-center transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">حاضر (الافتراضي)</span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.present}</span>
          </div>

          {/* Absent */}
          <div className="bg-slate-50 dark:bg-[#121215] rounded-xl p-3 border border-slate-200 dark:border-neutral-800 text-center transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">غائب</span>
            <span className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mt-0.5 block">{stats.absent}</span>
          </div>

          {/* Late */}
          <div className="bg-slate-50 dark:bg-[#121215] rounded-xl p-3 border border-slate-200 dark:border-neutral-800 text-center transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">متأخر</span>
            <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5 block">{stats.late}</span>
          </div>

          {/* Excused */}
          <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-slate-50 dark:bg-[#121215] rounded-xl p-3 border border-slate-200 dark:border-neutral-800 text-center transition-colors">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">عذر طبي</span>
            <span className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{stats.excused}</span>
          </div>
        </div>

        {/* Guidance Tip */}
        <div className="mt-3 p-2.5 bg-blue-50/70 dark:bg-[#0c1a2e] rounded-xl border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 text-xs sm:text-sm flex items-center justify-between gap-2 transition-colors">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>الرصد الذكي بالاستثناء:</strong> جميع الطلاب مسجلون كـ "حاضر" تلقائياً. اضغط فقط على اسم الطالب الغائب لتغيير حالته.
            </span>
          </div>
          <button
            type="button"
            onClick={handleSpeakStats}
            title="استماع للملخص صوتياً"
            className="flex-shrink-0 p-1.5 text-blue-800 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Authorization Alert Banner (Shown if user lacks permission to edit this group/period) */}
        {!authCheck.allowed && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
          >
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-amber-900">
                  وضع المشاهدة فقط • غير مسموح بتعديل هذا الكشف
                </p>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  {authCheck.reason}. بصفتك معلماً، يمكنك فقط تسجيل وتعديل الحضور لمجموعتك والحصص المسندة إليك، بينما يملك مدير المدرسة فقط صلاحية التعديل الكامل.
                </p>
              </div>
            </div>

            {currentTeacherSlot && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClassId(currentTeacherSlot.classId);
                  setSelectedPeriod(currentTeacherSlot.periodNumber);
                }}
                className="h-9 px-3.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer flex-shrink-0"
              >
                <span>الانتقال لحصتي الحالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        )}

        {/* Absent Students Spotlight Panel (Who are the absent students?) */}
        {absentStudentsList.length > 0 && (
          <div className="mt-3 p-3 bg-red-50/90 dark:bg-[#1a0808] border border-red-200 dark:border-red-900/60 rounded-xl text-xs sm:text-sm transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 dark:bg-red-500 animate-pulse" />
                <span className="font-bold text-red-950 dark:text-red-200">
                  قائمة الطلاب الغائبين في هذه الحصة ({absentStudentsList.length} طلاب):
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAbsentStudentsDrawer(!showAbsentStudentsDrawer)}
                className="text-xs font-bold text-red-800 dark:text-red-300 hover:text-red-950 dark:hover:text-red-100 flex items-center gap-1 cursor-pointer"
              >
                <span>{showAbsentStudentsDrawer ? 'إخفاء التفاصيل' : 'عرض الأسماء والهواتف'}</span>
                {showAbsentStudentsDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {showAbsentStudentsDrawer && (
              <div className="mt-2.5 pt-2.5 border-t border-red-200/80 dark:border-red-900/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {absentStudentsList.map(st => (
                  <div
                    key={st.id}
                    className="p-2.5 bg-white dark:bg-[#121215] rounded-lg border border-red-200 dark:border-red-900/60 flex items-center justify-between shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        مقعد {st.seatNumber}
                      </span>
                    </div>
                    <div className="text-left font-mono text-xs text-red-900 dark:text-red-300 bg-red-50 dark:bg-red-950/60 px-2 py-1 rounded border border-red-200 dark:border-red-900 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-red-700 dark:text-red-400" />
                      <span>{st.guardianPhone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Banner After Submission */}
      {justSubmittedBanner && (
        <div className="bg-emerald-600 text-white p-3.5 rounded-xl shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm sm:text-base">تم حفظ واعتماد كشف الحضور بنجاح!</p>
              <p className="text-emerald-100 text-xs">
                تم حفظ البيانات محلياً وتحديث مؤشرات المدرسة.
              </p>
            </div>
          </div>
          <button
            onClick={() => setJustSubmittedBanner(false)}
            className="p-1.5 text-white hover:bg-emerald-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Search Bar, Filter Chips & Batch Action Bar */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5">
          {/* Fast Search Input */}
          <div className="relative w-full md:flex-1">
            <input
              id="input-fast-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث سريع باسم الطالب..."
              className="w-full h-10 pl-10 pr-10 py-2 bg-slate-100 dark:bg-neutral-900 focus:bg-white dark:focus:bg-[#151518] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-medium text-sm rounded-xl border border-slate-200 dark:border-neutral-800 focus:border-blue-800 dark:focus:border-blue-500 focus:outline-hidden transition"
            />
            <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="مسح البحث"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Actions & Teacher Student Management */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Add Student Button */}
            <button
              id="btn-open-add-student"
              type="button"
              onClick={() => {
                setSelectedStudentForModal(null);
                setStudentModalMode('add');
                setIsStudentModalOpen(true);
              }}
              className="h-10 px-3 bg-blue-900 hover:bg-blue-800 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>إضافة طالب للفصل</span>
            </button>

            {/* Quick Bulk Add Button */}
            <button
              id="btn-open-bulk-add"
              type="button"
              onClick={() => {
                setSelectedStudentForModal(null);
                setStudentModalMode('bulk_add');
                setIsStudentModalOpen(true);
              }}
              title="إضافة سريعة بمجموعة أسماء"
              className="h-10 px-2.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1 border border-slate-200 dark:border-neutral-700 transition cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
              <span className="hidden sm:inline">إضافة سريعة بالأسماء</span>
            </button>

            {/* Print / Export Class Roster */}
            <button
              id="btn-print-class-roster"
              type="button"
              onClick={() => window.print()}
              title="طباعة وتصدير كشف الفصل"
              className="h-10 w-10 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center border border-slate-200 dark:border-neutral-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              id="btn-mark-all-present"
              type="button"
              disabled={isSessionLocked}
              onClick={markAllPresent}
              className="flex-1 md:flex-initial h-10 px-3.5 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              <span>الجميع حاضر</span>
            </button>

            <button
              id="btn-reset-attendance"
              type="button"
              disabled={isSessionLocked}
              onClick={resetAttendanceSession}
              title="إعادة ضبط الكشف"
              className="h-10 px-2.5 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1 border border-slate-200 dark:border-neutral-700 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">إعادة ضبط</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-neutral-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">تصفية:</span>

          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`h-8 px-3 rounded-lg font-semibold text-xs transition cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700 border border-transparent'
            }`}
          >
            الكل ({activeStudents.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('absent')}
            className={`h-8 px-3 rounded-lg font-semibold text-xs transition cursor-pointer ${
              filterStatus === 'absent'
                ? 'bg-red-700 dark:bg-red-600 text-white shadow-xs'
                : 'bg-red-50 dark:bg-red-950/50 text-red-900 dark:text-red-300 border border-red-200 dark:border-red-800/60 hover:bg-red-100 dark:hover:bg-red-900/60'
            }`}
          >
            الغياب فقط ({stats.absent})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('late')}
            className={`h-8 px-3 rounded-lg font-semibold text-xs transition cursor-pointer ${
              filterStatus === 'late'
                ? 'bg-amber-600 dark:bg-amber-500 text-white shadow-xs'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 hover:bg-amber-100 dark:hover:bg-amber-900/60'
            }`}
          >
            المتأخرين ({stats.late})
          </button>

          <button
            type="button"
            onClick={() => setFilterStatus('excused')}
            className={`h-8 px-3 rounded-lg font-semibold text-xs transition cursor-pointer ${
              filterStatus === 'excused'
                ? 'bg-blue-800 dark:bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
          >
            الأعذار ({stats.excused})
          </button>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-2.5">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
            <p className="text-base font-bold text-slate-700 mb-1">
              لا توجد نتائج مطابقة لبحثك
            </p>
            <p className="text-xs text-slate-500 mb-3">
              جرّب مسح البحث أو تغيير مرشح التصفية لعرض طلاب الفصل.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
              className="h-9 px-4 bg-blue-900 text-white font-bold text-xs rounded-lg cursor-pointer"
            >
              عرض جميع طلاب الفصل
            </button>
          </div>
        ) : (
          filteredStudents.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              currentStatus={currentRecords[student.id]?.status || 'present'}
              note={currentRecords[student.id]?.note}
              isLocked={isSessionLocked}
              fastLoadMode={fastLoadMode}
              onStatusChange={status => setStudentStatus(student.id, status)}
              onSaveNote={note => quickAddStudentNote(student.id, note)}
              onEditStudent={st => {
                setSelectedStudentForModal(st);
                setStudentModalMode('edit');
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={st => {
                setSelectedStudentForModal(st);
                setStudentModalMode('delete_confirm');
                setIsStudentModalOpen(true);
              }}
              onContactGuardian={st => {
                setSelectedStudentForModal(st);
                setStudentModalMode('contact');
                setIsStudentModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Sticky Bottom Submit Bar (Only shown when pending and not dismissed) */}
      <AnimatePresence>
        {shouldShowSubmitBar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            id="sticky-submit-bar"
            className="sticky bottom-18 md:bottom-4 z-30 bg-white/95 dark:bg-[#0d0d10] backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-slate-900 dark:text-white transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="text-right">
                <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex flex-wrap items-center gap-1.5">
                  <span>جاهز للاعتماد:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">{stats.present} حاضر</span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-red-700 dark:text-red-400 font-bold">{stats.absent} غائب</span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">{stats.late} متأخر</span>
                  {stats.excused > 0 && (
                    <>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span className="text-blue-700 dark:text-blue-400 font-bold">{stats.excused} بعذر</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 font-medium mt-0.5">
                  اضغط الزر الأخضر لتثبيت الكشف وحفظه في النظام
                </p>
              </div>

              {/* 'X' Close Button */}
              <button
                id="btn-close-submit-bar"
                type="button"
                onClick={handleDismissBar}
                aria-label="إغلاق شريط الاعتماد"
                title="إغلاق هذا الشريط"
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer flex-shrink-0 flex items-center gap-1 text-xs font-semibold"
              >
                <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
                <span className="text-xs text-slate-500 dark:text-slate-300 hidden sm:inline">إغلاق</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-submit-attendance-session"
                type="button"
                disabled={settings.emergencyLockdown}
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto h-11 px-5 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>حفظ واعتماد كشف الحضور</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation Dialog */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        classNameTitle={activeClass.name}
        periodNumber={selectedPeriod}
        date={currentDate}
        totalStudents={stats.total}
        presentCount={stats.present}
        absentCount={stats.absent}
        lateCount={stats.late}
        excusedCount={stats.excused}
        onConfirm={handleConfirmSubmit}
        onCancel={() => setShowConfirmModal(false)}
      />

      {/* Teacher Student Management Modal */}
      <StudentManagementModal
        isOpen={isStudentModalOpen}
        mode={studentModalMode}
        initialClassId={selectedClassId}
        studentToEdit={selectedStudentForModal}
        onClose={() => {
          setIsStudentModalOpen(false);
          setSelectedStudentForModal(null);
        }}
      />
    </div>
  );
};
