/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StaffRole } from '../types';
import { TeacherDashboardView } from './TeacherDashboardView';
import {
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Printer,
  Search,
  Sparkles,
  Layers,
} from 'lucide-react';

interface AdminDashboardViewProps {
  onOpenEmergencyModal: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onOpenEmergencyModal }) => {
  const {
    overallStats,
    classes,
    students,
    staff,
    updateStaffRole,
    settings,
    updateSetting,
    setSelectedClassId,
    setActiveTab,
    notifications,
    currentUser,
  } = useAttendance();

  const [staffSearch, setStaffSearch] = useState('');

  // If logged in as teacher, render the Teacher specialized hub
  if (currentUser?.role === 'teacher') {
    return (
      <div id="view-teacher-dashboard" className="space-y-4">
        <TeacherDashboardView />
      </div>
    );
  }

  const filteredStaff = staff.filter(m =>
    m.name.includes(staffSearch.trim()) || m.subjectOrDept.includes(staffSearch.trim())
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    // Generate CSV for Excel export with Ministry formatting
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'المملكة الأردنية الهاشمية - وزارة التربية والتعليم\n';
    csvContent += 'مدرسة الملك حسين بن طلال الثانوية للبنين - تقرير الحضور والغياب الشهري\n\n';
    csvContent += 'اسم الطالب,الفصل الدراسي,الرقم الوطني/التعريفي,أيام الحضور,أيام الغياب,الغياب بعذر,نسبة الحضور\n';

    students.forEach(st => {
      const className = classes.find(c => c.id === st.classId)?.name || 'عام';
      const presenceDays = 22 - st.consecutiveAbsences;
      const rate = Math.round((presenceDays / 22) * 100);
      csvContent += `"${st.name}","${className}","${st.id}","${presenceDays}","${st.consecutiveAbsences}","0","${rate}%"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `كشف_الغياب_الشهري_مدرسة_الملك_حسين_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="view-admin-dashboard" className="space-y-4">
      {/* Top Welcome & Actions Header */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs">
            لوحة الإدارة والمتابعة
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
            التقرير اليومي والمؤشرات المدرسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            متابعة فورية لمعدلات حضور الطلاب، إدارة صلاحيات الكادر، وضبط إعدادات المنصة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Emergency Lockdown Button */}
          <button
            id="btn-emergency-lockdown"
            type="button"
            onClick={onOpenEmergencyModal}
            className={`h-10 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs cursor-pointer ${
              settings.emergencyLockdown
                ? 'bg-red-700 hover:bg-red-800 text-white animate-pulse'
                : 'bg-amber-100 dark:bg-amber-950/50 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-950 dark:text-amber-200 border border-amber-400 dark:border-amber-700'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {settings.emergencyLockdown ? '⚠️ النظام مقفل طارئاً' : 'إغلاق النظام طارئاً'}
            </span>
          </button>

          {/* Excel Report Export */}
          <button
            id="btn-export-excel"
            type="button"
            onClick={handleExportExcel}
            className="h-10 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>تصدير Excel للوزارة</span>
          </button>

          {/* Print PDF Report Button */}
          <button
            id="btn-print-report"
            type="button"
            onClick={handlePrint}
            className="h-10 px-3.5 bg-blue-900 hover:bg-blue-800 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف PDF بختم المدرسة</span>
          </button>
        </div>
      </div>

      {/* High Absence Risk Alert (Students with 2+ consecutive absences) */}
      {students.filter(s => s.consecutiveAbsences >= 2).length > 0 && (
        <div className="bg-white dark:bg-[#0d0d0f] border border-red-200 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>الطلاب الأكثر عرضة للإنذار (غياب متكرر - يتطلب تواصل مع ولي الأمر)</span>
            </span>
            <span className="px-2.5 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-xs rounded-full border border-red-200 dark:border-red-900/60">
              {students.filter(s => s.consecutiveAbsences >= 2).length} طلاب
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {students
              .filter(s => s.consecutiveAbsences >= 2)
              .map(st => (
                <div
                  key={st.id}
                  className="p-2.5 bg-slate-50 dark:bg-[#121215] rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{st.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {classes.find(c => c.id === st.classId)?.name || 'فصل'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 font-bold text-[10px] rounded-md font-mono border border-red-200 dark:border-red-900/60">
                    غياب {st.consecutiveAbsences} أيام
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Visual Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Students */}
        <div
          id="pulse-card-total"
          className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-neutral-700 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">إجمالي طلاب المدرسة</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white block tracking-tight">
              {overallStats.totalStudents}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">طالب مقيد بالمراحل الحالية</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            موزعون على {classes.length} فصول دراسية
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div
          id="pulse-card-presence"
          className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-800/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">الحضور اليوم</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-600 dark:text-emerald-400 block tracking-tight">
                {overallStats.totalPresent}
              </span>
              <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                ({overallStats.attendanceRate}%)
              </span>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">نسبة حضور ممتازة اليوم</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            يشمل {overallStats.totalLate} طلاب متأخرين
          </div>
        </div>

        {/* Card 3: Today's Absence */}
        <div
          id="pulse-card-absence"
          className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-red-300 dark:hover:border-red-800/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">الغياب اليوم</span>
            <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/60 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 block tracking-tight">
              {overallStats.totalAbsent}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">طلاب متغيبون عن الحصص</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            {overallStats.totalExcused} بعذر طبي رسمي
          </div>
        </div>

        {/* Card 4: Urgent Alerts */}
        <div
          id="pulse-card-alerts"
          className="bg-white dark:bg-[#0d0d0f] rounded-2xl p-4 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between hover:border-amber-300 dark:hover:border-amber-800/60 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">التنبيهات المدرسية</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-400 block tracking-tight">
              {notifications.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">تنبيهات وحالات متابعة</span>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-neutral-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            منها 2 غياب متكرر لأكثر من يومين
          </div>
        </div>
      </div>

      {/* Class Attendance Summary Breakdown Table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            موقف الحضور حسب الفصول الدراسية
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            اضغط على أي فصل للانتقال للرصد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 font-bold">
                <th className="p-3 rounded-tr-xl">اسم الفصل</th>
                <th className="p-3">رائد الفصل</th>
                <th className="p-3 text-center">عدد الطلاب</th>
                <th className="p-3 text-center">القاعة</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center rounded-tl-xl">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
              {classes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{c.name}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{c.gradeLevel}</span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{c.homeroomTeacher}</td>
                  <td className="p-3 text-center font-bold text-slate-900 dark:text-white">{c.studentCount} طالب</td>
                  <td className="p-3 text-center text-slate-600 dark:text-slate-400">{c.room}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-700 dark:text-emerald-400" />
                      <span>مكتمل الرصد</span>
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassId(c.id);
                        setActiveTab('take_attendance');
                      }}
                      className="h-8 px-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                    >
                      فتح الكشف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Feature Toggles */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs">
            التحكم بالنظام
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
            مفاتيح التشغيل والإيقاف للخصائص
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            تفعيل أو إيقاف آليات التنبيه والتحضير التلقائي بضغطة واحدة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Toggle 1: SMS Alerts */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                رسائل وتنبيهات الغياب لأولياء الأمور
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                إرسال رسالة فورية لولي أمر الطالب الغائب فور اعتماد كشف الحصة.
              </p>
            </div>
            <button
              type="button"
              id="toggle-sms-alerts"
              onClick={() => updateSetting('enableSmsAlerts', !settings.enableSmsAlerts)}
              className="p-1 rounded-xl cursor-pointer"
              aria-label="تبديل تفعيل رسائل الغياب"
            >
              {settings.enableSmsAlerts ? (
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

          {/* Toggle 2: Pause Alerts on Holidays */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                إيقاف التنبيهات في العطلات ونهاية الأسبوع
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                كتم كافة الإشعارات يومي الجمعة والسبت والإجازات الرسمية.
              </p>
            </div>
            <button
              type="button"
              id="toggle-pause-holidays"
              onClick={() => updateSetting('pauseAlertsOnHolidays', !settings.pauseAlertsOnHolidays)}
              className="p-1 rounded-xl cursor-pointer"
              aria-label="تبديل إيقاف التنبيهات في العطلات"
            >
              {settings.pauseAlertsOnHolidays ? (
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

          {/* Toggle 3: Default All Present */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                التحضير الذكي الافتراضي (الكل حاضر)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تسريع عملية التحضير المباشر بجعل جميع الطلاب حاضرين تلقائياً.
              </p>
            </div>
            <button
              type="button"
              id="toggle-default-present"
              onClick={() => updateSetting('defaultAllPresent', !settings.defaultAllPresent)}
              className="p-1 rounded-xl cursor-pointer"
              aria-label="تبديل التحضير الافتراضي حاضر"
            >
              {settings.defaultAllPresent ? (
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

          {/* Toggle 4: Allow Offline Attendance Mode */}
          <div className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                السماح بالتحضير دون اتصال بالإنترنت
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حفظ كافة الكشوف محلياً على الجهاز وإعادة المزامنة تلقائياً.
              </p>
            </div>
            <button
              type="button"
              id="toggle-allow-offline"
              onClick={() => updateSetting('allowOfflineMode', !settings.allowOfflineMode)}
              className="p-1 rounded-xl cursor-pointer"
              aria-label="تبديل التحضير دون إنترنت"
            >
              {settings.allowOfflineMode ? (
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

      {/* Staff Roles List */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs">
              إدارة الكادر المدرسي
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1">
              قائمة المعلمين والمشرفين والصلاحيات
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              تحديد صلاحية كل موظف (مدير، مشرف، معلم) مع تطبيق فوري للتغييرات.
            </p>
          </div>

          {/* Quick Staff Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={staffSearch}
              onChange={e => setStaffSearch(e.target.value)}
              placeholder="ابحث باسم المعلم..."
              className="w-full h-9 pl-3 pr-8 bg-slate-100 dark:bg-neutral-950 text-slate-900 dark:text-white font-medium rounded-xl border border-slate-200 dark:border-neutral-700 focus:outline-hidden text-xs sm:text-sm"
            />
            <Search className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-neutral-800 border-b border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-slate-200 font-bold">
                <th className="p-3 rounded-tr-xl">اسم العضو</th>
                <th className="p-3">المسمى / التخصص</th>
                <th className="p-3">رقم التواصل</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 rounded-tl-xl">الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-neutral-800 font-medium">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-neutral-800/50 transition">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{member.name}</span>
                  </td>
                  <td className="p-3 text-slate-700 dark:text-slate-300">{member.subjectOrDept}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-xs">{member.phone}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold">
                      {member.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <select
                      id={`select-role-${member.id}`}
                      value={member.role}
                      onChange={e => updateStaffRole(member.id, e.target.value as StaffRole)}
                      className={`h-8 px-2.5 rounded-lg font-semibold text-xs border cursor-pointer focus:outline-hidden transition ${
                        member.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                          : member.role === 'supervisor'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-neutral-800 text-slate-900 dark:text-slate-200 border-slate-200 dark:border-neutral-700'
                      }`}
                    >
                      <option value="teacher">معلم (رصد الحضور)</option>
                      <option value="supervisor">مشرف (متابعة الفصول والتقارير)</option>
                      <option value="admin">مدير (صلاحيات كاملة)</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
