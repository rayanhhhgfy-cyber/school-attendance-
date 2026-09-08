/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  Users,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Edit2,
  Phone,
  Filter,
} from 'lucide-react';

export const TodaysAttendanceView: React.FC = () => {
  const {
    classes,
    students,
    selectedPeriod,
    setSelectedPeriod,
    currentDate,
    isSessionSubmitted,
    getSessionMeta,
    setSelectedClassId,
    setActiveTab,
    currentUser,
    submittedSessions,
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassIdLocal, setSelectedClassIdLocal] = useState<string | null>(classes[0]?.id || null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

  const formattedDate = new Date(currentDate).toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.includes(searchQuery) || cls.room.includes(searchQuery);
    if (!matchesSearch) return false;

    const isSubmitted = isSessionSubmitted(cls.id, selectedPeriod, currentDate);
    if (statusFilter === 'confirmed') return isSubmitted;
    if (statusFilter === 'pending') return !isSubmitted;
    return true;
  });

  const activeSelectedClass = classes.find(c => c.id === selectedClassIdLocal) || classes[0];
  const activeClassStudents = students.filter(s => s.classId === activeSelectedClass?.id);

  const selectedClassIsSubmitted = activeSelectedClass
    ? isSessionSubmitted(activeSelectedClass.id, selectedPeriod, currentDate)
    : false;
  const selectedClassMeta = activeSelectedClass
    ? getSessionMeta(activeSelectedClass.id, selectedPeriod, currentDate)
    : undefined;

  return (
    <div id="view-todays-attendance" className="space-y-5">
      {/* Header Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold text-xs rounded-full border border-emerald-300 dark:border-emerald-800/60">
              كشف حضور اليوم الشامل
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              متابعة حية لكافة الفصول
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            سجل حضور اليوم لكل فصول المدرسة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            تاريخ اليوم: <strong className="text-slate-800 dark:text-slate-200 font-sans">{formattedDate} ({currentDate})</strong>
          </p>
        </div>

        {/* Period Selector Bar */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-neutral-950 p-1.5 rounded-2xl border border-slate-200 dark:border-neutral-800">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 px-2">الحصة:</span>
          {[1, 2, 3, 4, 5].map(p => {
            const isSelected = selectedPeriod === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPeriod(p)}
                className={`h-9 px-3 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                }`}
              >
                <span>الحصة {p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-neutral-900 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الفصل أو القاعة..."
            className="w-full h-10 pl-9 pr-9 bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-white rounded-xl text-xs font-semibold border border-slate-200 dark:border-neutral-800 focus:outline-hidden"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حالة الكشف:</span>
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-900 dark:bg-blue-600 text-white'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            الكل ({classes.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('confirmed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'confirmed'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
            }`}
          >
            المؤكد فقط
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
            }`}
          >
            غير المؤكد
          </button>
        </div>
      </div>

      {/* Grid of School Classes with Live Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClasses.map(cls => {
          const isSubmitted = isSessionSubmitted(cls.id, selectedPeriod, currentDate);
          const meta = getSessionMeta(cls.id, selectedPeriod, currentDate);
          const clsStudents = students.filter(s => s.classId === cls.id);
          const isSelected = selectedClassIdLocal === cls.id;

          return (
            <div
              key={cls.id}
              onClick={() => setSelectedClassIdLocal(cls.id)}
              className={`p-4 rounded-3xl border-2 transition cursor-pointer space-y-3 ${
                isSelected
                  ? 'bg-white dark:bg-neutral-900 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/40'
                  : 'bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-2.5">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {cls.name}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {cls.gradeLevel} • {cls.room}
                  </span>
                </div>

                {isSubmitted ? (
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-extrabold text-xs rounded-xl border border-emerald-300 dark:border-emerald-800/60 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>مؤكد ✓</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl border border-amber-300 dark:border-amber-800/60 flex items-center gap-1">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>غير مؤكد</span>
                  </span>
                )}
              </div>

              {/* Class Attendance Summary Bar */}
              {isSubmitted && meta ? (
                <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs pt-1">
                  <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                    <span className="text-[10px] text-emerald-800 dark:text-emerald-300 block font-sans">حاضر</span>
                    <span className="font-bold text-emerald-900 dark:text-emerald-200">{meta.present}</span>
                  </div>
                  <div className="p-1.5 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50">
                    <span className="text-[10px] text-red-800 dark:text-red-300 block font-sans">غائب</span>
                    <span className="font-bold text-red-900 dark:text-red-200">{meta.absent}</span>
                  </div>
                  <div className="p-1.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900/50">
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 block font-sans">متأخر</span>
                    <span className="font-bold text-amber-900 dark:text-amber-200">{meta.late}</span>
                  </div>
                  <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50">
                    <span className="text-[10px] text-blue-800 dark:text-blue-300 block font-sans">بعذر</span>
                    <span className="font-bold text-blue-900 dark:text-blue-200">{meta.excused}</span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 text-xs text-slate-500 dark:text-slate-400">
                  إجمالي طلاب الفصل: <strong className="text-slate-900 dark:text-white">{clsStudents.length} طالب</strong> • كشف هذه الحصة لم يُعتمد بعد.
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {meta?.submittedTeacherName ? `المعلم: ${meta.submittedTeacherName}` : `رائد الفصل: ${cls.homeroomTeacher}`}
                </span>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedClassId(cls.id);
                    setActiveTab('take_attendance');
                  }}
                  className={`h-8 px-3 rounded-xl font-bold transition cursor-pointer flex items-center gap-1 ${
                    isSubmitted
                      ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      : 'bg-blue-900 hover:bg-blue-800 text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{isSubmitted ? 'عرض / تعديل' : 'رصد الحضور'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Roster Details View */}
      {activeSelectedClass && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-neutral-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  كشف طلاب: {activeSelectedClass.name}
                </h3>
                <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 text-xs font-bold rounded-full">
                  الحصة {selectedPeriod}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedClassIsSubmitted
                  ? `الكشف معتمد ومحفوظ (${selectedClassMeta?.submittedAt || ''}) بواسطة: ${selectedClassMeta?.submittedTeacherName || 'المعلم'}`
                  : 'الكشف غير معتمد لهذه الحصة حتى الآن.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedClassId(activeSelectedClass.id);
                setActiveTab('take_attendance');
              }}
              className="h-10 px-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
            >
              <Edit2 className="w-4 h-4 text-emerald-300" />
              <span>تعديل كشف حضور هذا الفصل</span>
            </button>
          </div>

          {/* Student Roster Table */}
          <div className="overflow-x-auto border border-slate-200 dark:border-neutral-800 rounded-2xl">
            <table className="w-full text-right border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100 dark:bg-neutral-950 border-b border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-300 font-bold">
                  <th className="p-3">رقم المقعد</th>
                  <th className="p-3">اسم الطالب الرباعي</th>
                  <th className="p-3">حالة الحضور الحالية</th>
                  <th className="p-3">ولي الأمر والهاتف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
                {activeClassStudents.map(student => {
                  return (
                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition">
                      <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        #{student.seatNumber}
                      </td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          ✓ حاضر (معتمد)
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono" dir="ltr">
                        {student.guardianPhone || student.parentPhone || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
