/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types';
import { MedicalExcuseModal } from './MedicalExcuseModal';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  ChevronDown,
  UserCheck,
  RotateCcw,
  Printer,
  Download,
  CheckCheck,
  Sparkles,
} from 'lucide-react';

export const AttendanceHistoryView: React.FC = () => {
  const {
    classes,
    students,
    submittedSessions,
    getSessionMeta,
    isSessionSubmitted,
    reopenAttendanceSession,
    setSelectedClassId,
    setSelectedPeriod,
    setCurrentDate,
    setActiveTab,
    getStudentExcuse,
    currentUser,
    canUserEditAttendance,
  } = useAttendance();

  // Selected History Filters
  const [historyDate, setHistoryDate] = useState<string>(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  });

  const [historyClassId, setHistoryClassId] = useState<string>(classes[0]?.id || 'class-9th');
  const [historyPeriod, setHistoryPeriod] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  // Selected student for medical excuse preview
  const [selectedStudentForExcuse, setSelectedStudentForExcuse] = useState<any>(null);

  // Derive class object
  const activeClass = classes.find(c => c.id === historyClassId) || classes[0];

  // Derive students in class
  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === historyClassId);
  }, [students, historyClassId]);

  // Derive session records for the selected date, class, and period
  const sessionKey = `${historyClassId}_${historyDate}_p${historyPeriod}`;
  const sessionMeta = getSessionMeta(historyClassId, historyPeriod, historyDate);
  const isSubmitted = isSessionSubmitted(historyClassId, historyPeriod, historyDate);

  // Retrieve records map from localStorage or default
  const savedRecords = useMemo(() => {
    try {
      const raw = localStorage.getItem('school_att_records');
      if (raw) {
        const map = JSON.parse(raw);
        return map[sessionKey] || {};
      }
    } catch {}
    return {};
  }, [sessionKey]);

  // Statistics
  const stats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let late = 0;
    let excused = 0;

    classStudents.forEach(st => {
      const status = savedRecords[st.id]?.status || 'present';
      if (status === 'present') present++;
      else if (status === 'absent') absent++;
      else if (status === 'late') late++;
      else if (status === 'excused') excused++;
    });

    return {
      total: classStudents.length,
      present,
      absent,
      late,
      excused,
    };
  }, [classStudents, savedRecords]);

  // Quick past days list (Past 7 days)
  const recentDays = useMemo(() => {
    const days = [];
    const daysMap = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = daysMap[d.getDay()];
      days.push({
        dateStr,
        dayName,
        isToday: i === 0,
      });
    }
    return days;
  }, []);

  // Filtered Students list
  const filteredStudents = useMemo(() => {
    return classStudents.filter(st => {
      const matchesSearch =
        st.name.includes(searchQuery) ||
        st.seatNumber.toString().includes(searchQuery);

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;

      const stStatus = savedRecords[st.id]?.status || 'present';
      return stStatus === statusFilter;
    });
  }, [classStudents, searchQuery, statusFilter, savedRecords]);

  const handleEditThisSession = () => {
    setSelectedClassId(historyClassId);
    setSelectedPeriod(historyPeriod);
    setCurrentDate(historyDate);
    setActiveTab('take_attendance');
  };

  return (
    <div id="view-attendance-history" className="space-y-4">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-neutral-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>أرشيف وسجلات الأيام السابقة</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              سجلات حضور الحصص والأيام السابقة
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              استعرض كشوفات الحضور للتواريخ السابقة، حدد الفصل والحصة لمعاينة أسماء الغائبين والأعذار الطبية المرفقة.
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="h-9 px-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer self-start md:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة السجل المحدد</span>
          </button>
        </div>

        {/* Date / Day Quick Select Strip */}
        <div className="pt-3">
          <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
            اختر اليوم والتاريخ للطلب:
          </label>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {recentDays.map(item => (
              <button
                key={item.dateStr}
                type="button"
                onClick={() => setHistoryDate(item.dateStr)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                  historyDate === item.dateStr
                    ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-800 shadow-xs'
                    : 'bg-slate-50 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.dayName}</span>
                <span className="font-mono text-[11px] opacity-80">({item.dateStr})</span>
                {item.isToday && (
                  <span className="px-1.5 py-0.2 bg-emerald-500 text-white rounded text-[9px]">اليوم</span>
                )}
              </button>
            ))}

            {/* Custom Date Picker */}
            <div className="relative shrink-0">
              <input
                type="date"
                value={historyDate}
                onChange={e => setHistoryDate(e.target.value)}
                className="h-9 px-3 bg-slate-100 dark:bg-neutral-900 text-slate-900 dark:text-white font-bold text-xs rounded-xl border border-slate-300 dark:border-neutral-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Filter Controls: Class & Period */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-neutral-800 mt-3">
          {/* Class Select */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              الفصل الدراسي:
            </label>
            <select
              value={historyClassId}
              onChange={e => setHistoryClassId(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-xs sm:text-sm font-bold text-slate-900 dark:text-white cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.studentCount} طالب)
                </option>
              ))}
            </select>
          </div>

          {/* Period Select Buttons */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
              رقم الحصة:
            </label>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-neutral-950 p-1 rounded-xl border border-slate-200 dark:border-neutral-800">
              {[1, 2, 3, 4, 5, 6].map(p => {
                const isPSubmitted = isSessionSubmitted(historyClassId, p, historyDate);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setHistoryPeriod(p)}
                    className={`flex-1 h-8 rounded-lg font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 ${
                      historyPeriod === p
                        ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-2xs'
                        : isPSubmitted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span>الحصة {p}</span>
                    {isPSubmitted && <CheckCircle className="w-3 h-3 text-emerald-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Session Metadata Banner */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base ${
              isSubmitted
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
            }`}
          >
            {isSubmitted ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {activeClass.name} — الحصة {historyPeriod} ({historyDate})
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isSubmitted
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                }`}
              >
                {isSubmitted ? 'معتمد ومحفوظ ✓' : 'غير معتمد'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {sessionMeta?.submittedTeacherName ? `المعلم المسؤول: ${sessionMeta.submittedTeacherName}` : 'كشف مسجل'}
              {sessionMeta?.submittedAt ? ` • وقت الاعتماد: ${sessionMeta.submittedAt}` : ''}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEditThisSession}
          className="h-9 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>فتح ورصد هذا الكشف</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 bg-white dark:bg-[#0d0d0f] rounded-xl border border-slate-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-slate-500 block">إجمالي الفصل</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">{stats.total}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0d0d0f] rounded-xl border border-slate-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-emerald-600 block">الححاضرون</span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">{stats.present}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0d0d0f] rounded-xl border border-slate-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-red-600 block">الغياب</span>
          <span className="text-xl font-bold text-red-600 dark:text-red-400 mt-0.5 block">{stats.absent}</span>
        </div>
        <div className="p-3 bg-white dark:bg-[#0d0d0f] rounded-xl border border-slate-200 dark:border-neutral-800 text-center">
          <span className="text-xs text-blue-600 block">الأعذار الطبية</span>
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">{stats.excused}</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-3 border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث باسم الطالب في هذا اليوم..."
            className="w-full h-9 pl-3 pr-8 bg-slate-100 dark:bg-neutral-950 text-xs font-semibold rounded-xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white"
          />
          <Search className="w-3.5 h-3.5 absolute right-2.5 top-3 text-slate-400" />
        </div>

        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            الكل ({classStudents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('absent')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'absent'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
            }`}
          >
            الغياب ({stats.absent})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('excused')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              statusFilter === 'excused'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
            }`}
          >
            الأعذار ({stats.excused})
          </button>
        </div>
      </div>

      {/* Student Records List */}
      <div className="bg-white dark:bg-[#0d0d0f] rounded-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden shadow-xs">
        <table className="w-full text-right border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-100 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 font-bold">
              <th className="p-3">#</th>
              <th className="p-3">اسم الطالب</th>
              <th className="p-3">المقعد</th>
              <th className="p-3">حالة الحضور</th>
              <th className="p-3">الملاحظة المسجلة</th>
              <th className="p-3 text-center">العذر الطبي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                  لا توجد نتائج مطابقة لمرشح البحث.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student, idx) => {
                const rec = savedRecords[student.id];
                const status: AttendanceStatus = rec?.status || 'present';
                const excuse = getStudentExcuse(student.id, historyDate);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition">
                    <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{student.name}</td>
                    <td className="p-3 font-mono font-bold text-blue-900 dark:text-blue-400">{student.seatNumber}</td>
                    <td className="p-3">
                      {status === 'present' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 font-bold text-xs rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>حاضر</span>
                        </span>
                      )}
                      {status === 'absent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300 border border-red-300 font-bold text-xs rounded-full">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>غائب</span>
                        </span>
                      )}
                      {status === 'late' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 font-bold text-xs rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>متأخر</span>
                        </span>
                      )}
                      {status === 'excused' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 font-bold text-xs rounded-full">
                          <FileText className="w-3 h-3 text-blue-600" />
                          <span>عذر طبي</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {rec?.note || '—'}
                    </td>
                    <td className="p-3 text-center">
                      {excuse ? (
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForExcuse(student)}
                          className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 font-bold text-xs rounded-lg border border-blue-300 cursor-pointer hover:bg-blue-200 transition inline-flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span>استعراض / تحميل العذر 📄</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">لا يوجد عذر مرفق</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Medical Excuse View Modal if selected */}
      {selectedStudentForExcuse && (
        <MedicalExcuseModal
          student={selectedStudentForExcuse}
          date={historyDate}
          isOpen={!!selectedStudentForExcuse}
          onClose={() => setSelectedStudentForExcuse(null)}
        />
      )}
    </div>
  );
};
