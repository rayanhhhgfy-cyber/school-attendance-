/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { StaffRole } from '../types';
import { ManagerControlCenter } from './ManagerControlCenter';
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
            لوحة الإدارة والمتابعة
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            التقرير اليومي والمؤشرات المدرسية
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
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
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-400'
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

      {/* Feature 3: Smart Attendance Analytics & Predictive Risk Insights */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full font-bold text-xs flex items-center gap-1 w-fit">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>تحليلات ذكية والتنبؤ بالمخاطر</span>
            </span>
            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              مؤشرات الغياب الحرج والإنذار المبكر
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">محدث فورياً وفق البيانات الميدانية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* High Absence Risk Students */}
          <div className="p-4 bg-red-50/80 rounded-2xl border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-950 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span>الطلاب الأكثر عرضة للإنذار (غياب متكرر)</span>
              </span>
              <span className="px-2 py-0.5 bg-red-200 text-red-900 font-black text-xs rounded-full">
                {students.filter(s => s.consecutiveAbsences >= 2).length} طلاب
              </span>
            </div>
            <p className="text-[11px] text-red-800 leading-snug">
              الطلاب الذين وصل غيابهم لـ 2 أيام متتالية أو أكثر ويحتاجون لتواصل عاجل مع ولي الأمر.
            </p>
            <div className="space-y-1.5 pt-1">
              {students
                .filter(s => s.consecutiveAbsences >= 2)
                .slice(0, 3)
                .map(st => (
                  <div
                    key={st.id}
                    className="p-2 bg-white rounded-xl border border-red-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{st.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {classes.find(c => c.id === st.classId)?.name || 'فصل'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-red-100 text-red-800 font-bold text-[10px] rounded-md font-mono">
                      غياب {st.consecutiveAbsences} أيام
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Peak Absence Days Analysis */}
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1">
                <Layers className="w-4 h-4 text-blue-700" />
                <span>تحليل أيام ذروة الغياب المدرسية</span>
              </span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-900 font-bold text-xs rounded-full">
                يوم الخميس (الأعلى)
              </span>
            </div>
            <p className="text-[11px] text-blue-800 leading-snug">
              تسجل أيام الخميس والأربعاء أعلى نسب غياب متكررة بالمدرسة (معدل 8.4%).
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>الخميس (قبل الإجازة)</span>
                  <span className="text-red-700">12% غياب</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full w-[85%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span>الأحد (بداية الأسبوع)</span>
                  <span className="text-emerald-700">3% غياب</span>
                </div>
                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-[25%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Early Warning Prevention Metrics */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>مؤشر الوقاية والانتظام العام</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold text-xs rounded-full">
                94% انضباط
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-snug">
              نسبة طلاب الثانوية الذين حققوا نسبة حضور كاملة خلال الأسابيع الأربعة الماضية.
            </p>
            <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center space-y-1">
              <span className="text-2xl font-black text-emerald-700 block">
                {students.length - students.filter(s => s.consecutiveAbsences >= 2).length} / {students.length}
              </span>
              <span className="text-[11px] text-slate-500 font-medium block">
                طالب منتظم بدون أي حرمان دراسي
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Pulse Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Students */}
        <div
          id="pulse-card-total"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-600">إجمالي طلاب المدرسة</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-slate-900 block tracking-tight">
              {overallStats.totalStudents}
            </span>
            <span className="text-xs text-slate-500 font-medium">طالب مقيد بالمراحل الحالية</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-xs font-medium text-slate-500">
            موزعون على {classes.length} فصول دراسية
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div
          id="pulse-card-presence"
          className="bg-emerald-50 rounded-2xl p-4 border border-emerald-300 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-emerald-900">الحضور اليوم</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-200 text-emerald-900 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-bold text-emerald-700 block tracking-tight">
                {overallStats.totalPresent}
              </span>
              <span className="text-lg font-bold text-emerald-800">
                ({overallStats.attendanceRate}%)
              </span>
            </div>
            <span className="text-xs text-emerald-900 font-medium">نسبة حضور ممتازة اليوم</span>
          </div>
          <div className="pt-2 border-t border-emerald-200 text-xs font-medium text-emerald-900">
            يشمل {overallStats.totalLate} طلاب متأخرين
          </div>
        </div>

        {/* Card 3: Today's Absence */}
        <div
          id="pulse-card-absence"
          className="bg-red-50 rounded-2xl p-4 border border-red-300 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-red-900">الغياب اليوم</span>
            <div className="w-9 h-9 rounded-xl bg-red-200 text-red-900 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-red-700 block tracking-tight">
              {overallStats.totalAbsent}
            </span>
            <span className="text-xs text-red-900 font-medium">طلاب متغيبون عن الحصص</span>
          </div>
          <div className="pt-2 border-t border-red-200 text-xs font-medium text-red-900">
            {overallStats.totalExcused} بعذر طبي رسمي
          </div>
        </div>

        {/* Card 4: Urgent Alerts */}
        <div
          id="pulse-card-alerts"
          className="bg-amber-50 rounded-2xl p-4 border border-amber-300 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-950">التنبيهات المدرسية</span>
            <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2.5">
            <span className="text-3xl sm:text-4xl font-bold text-amber-800 block tracking-tight">
              {notifications.length}
            </span>
            <span className="text-xs text-amber-950 font-medium">تنبيهات وحالات متابعة</span>
          </div>
          <div className="pt-2 border-t border-amber-200 text-xs font-medium text-amber-950">
            منها 2 غياب متكرر لأكثر من يومين
          </div>
        </div>
      </div>

      {/* Manager Full Control Center: Passwords, Teachers, Timetable & Periods */}
      <ManagerControlCenter />

      {/* Class Attendance Summary Breakdown Table */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            موقف الحضور حسب الفصول الدراسية
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            اضغط على أي فصل للانتقال للرصد
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 rounded-tr-xl">اسم الفصل</th>
                <th className="p-3">رائد الفصل</th>
                <th className="p-3 text-center">عدد الطلاب</th>
                <th className="p-3 text-center">القاعة</th>
                <th className="p-3 text-center">الحالة</th>
                <th className="p-3 text-center rounded-tl-xl">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {classes.map(c => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{c.name}</span>
                    <span className="text-[11px] text-slate-500">{c.gradeLevel}</span>
                  </td>
                  <td className="p-3 text-slate-700">{c.homeroomTeacher}</td>
                  <td className="p-3 text-center font-bold text-slate-900">{c.studentCount} طالب</td>
                  <td className="p-3 text-center text-slate-600">{c.room}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold">
                      <CheckCircle className="w-3 h-3 text-emerald-700" />
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
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
            التحكم بالنظام
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
            مفاتيح التشغيل والإيقاف للخصائص
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            تفعيل أو إيقاف آليات التنبيه والتحضير التلقائي بضغطة واحدة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Toggle 1: SMS Alerts */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                رسائل وتنبيهات الغياب لأولياء الأمور
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div className="w-12 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Toggle 2: Pause Alerts on Holidays */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                إيقاف التنبيهات في العطلات ونهاية الأسبوع
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div className="w-12 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Toggle 3: Default All Present */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                التحضير الذكي الافتراضي (الكل حاضر)
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div className="w-12 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Toggle 4: Allow Offline Attendance Mode */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                السماح بالتحضير دون اتصال بالإنترنت
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
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
                <div className="w-12 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Staff Roles List */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
              إدارة الكادر المدرسي
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              قائمة المعلمين والمشرفين والصلاحيات
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
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
              className="w-full h-9 pl-3 pr-8 bg-slate-100 text-slate-900 font-medium rounded-xl border border-slate-200 focus:outline-hidden text-xs sm:text-sm"
            />
            <Search className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <th className="p-3 rounded-tr-xl">اسم العضو</th>
                <th className="p-3">المسمى / التخصص</th>
                <th className="p-3">رقم التواصل</th>
                <th className="p-3">الحالة</th>
                <th className="p-3 rounded-tl-xl">الصلاحية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 transition">
                  <td className="p-3">
                    <span className="font-bold text-slate-900 block">{member.name}</span>
                  </td>
                  <td className="p-3 text-slate-700">{member.subjectOrDept}</td>
                  <td className="p-3 text-slate-600 font-mono text-xs">{member.phone}</td>
                  <td className="p-3">
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
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
                          ? 'bg-purple-50 text-purple-900 border-purple-300'
                          : member.role === 'supervisor'
                          ? 'bg-blue-50 text-blue-900 border-blue-300'
                          : 'bg-slate-50 text-slate-900 border-slate-200'
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
