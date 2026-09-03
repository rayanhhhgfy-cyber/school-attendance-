/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';
import {
  SlidersHorizontal,
  Volume2,
  Zap,
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  LogOut,
  UserCheck,
  Shield,
  Bell,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Eye,
  Type,
  Users,
  FileText,
  Clock,
  Phone,
  BookOpen,
} from 'lucide-react';
import { speakArabic } from '../utils/audio';

interface SettingsAccessibilityViewProps {
  onOpenLoginModal?: () => void;
}

export const SettingsAccessibilityView: React.FC<SettingsAccessibilityViewProps> = ({
  onOpenLoginModal,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    logout,
    updateUserAccount,
    fastLoadMode,
    setFastLoadMode,
    soundEnabled,
    setSoundEnabled,
    lastSavedAt,
    settings,
    updateSetting,
    triggerTestAlert,
    addNotification,
    classes,
    timetable,
    students,
  } = useAttendance();

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Personal Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileSubject, setProfileSubject] = useState(currentUser?.subject || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Display Preferences State (Stored in localStorage for persistence)
  const [largeFontMode, setLargeFontMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_large_font') === 'true';
    } catch {
      return false;
    }
  });

  const [compactDisplayMode, setCompactDisplayMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_compact_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [autoMarkPresent, setAutoMarkPresent] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_auto_present') !== 'false';
    } catch {
      return true;
    }
  });

  // Notification Preferences State
  const [notifyBeforePeriod, setNotifyBeforePeriod] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_notify_period') !== 'false';
    } catch {
      return true;
    }
  });

  const [notifyAttendanceDelayed, setNotifyAttendanceDelayed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_notify_delayed') !== 'false';
    } catch {
      return true;
    }
  });

  const [notifyConsecutiveAbsence, setNotifyConsecutiveAbsence] = useState<boolean>(() => {
    try {
      return localStorage.getItem('pref_notify_absence') !== 'false';
    } catch {
      return true;
    }
  });

  const handleToggleLargeFont = (val: boolean) => {
    setLargeFontMode(val);
    try {
      localStorage.setItem('pref_large_font', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleCompactMode = (val: boolean) => {
    setCompactDisplayMode(val);
    try {
      localStorage.setItem('pref_compact_mode', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleAutoPresent = (val: boolean) => {
    setAutoMarkPresent(val);
    try {
      localStorage.setItem('pref_auto_present', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleNotifyPeriod = (val: boolean) => {
    setNotifyBeforePeriod(val);
    try {
      localStorage.setItem('pref_notify_period', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleNotifyDelayed = (val: boolean) => {
    setNotifyAttendanceDelayed(val);
    try {
      localStorage.setItem('pref_notify_delayed', String(val));
    } catch {
      // ignore
    }
  };

  const handleToggleNotifyAbsence = (val: boolean) => {
    setNotifyConsecutiveAbsence(val);
    try {
      localStorage.setItem('pref_notify_absence', String(val));
    } catch {
      // ignore
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateUserAccount(currentUser.id, {
      name: profileName.trim() || currentUser.name,
      subject: profileSubject.trim() || currentUser.subject,
      phone: profilePhone.trim() || currentUser.phone,
    });

    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleTestSpeech = () => {
    speakArabic(
      'مرحباً بك في منصة الحضور المدرسي الذكي. نظام متطور وسريع لتسجيل الحضور وإدارة الفصول وجداول المعلمين.'
    );
  };

  const handleTestNotification = () => {
    addNotification(
      '🔔 إشعار تجريبي من الإعدادات',
      'تم التحقق من عمل نظام التنبيهات والإشعارات الذكية بنجاح.',
      'reminder'
    );
  };

  const handleExportBackup = () => {
    try {
      const dataToExport = {
        exportedAt: new Date().toISOString(),
        appName: 'منصة الحضور المدرسي الذكي',
        classes,
        students,
        timetable,
        settings,
        currentUser: currentUser ? { name: currentUser.name, role: currentUser.role } : null,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `school-attendance-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Backup error:', err);
    }
  };

  const handleResetStorage = () => {
    if (
      window.confirm(
        '⚠️ تحذير: هل أنت متأكد من رغبتك في إعادة ضبط البيانات المحلية إلى الحالة الافتراضية؟ سيتم مسح السجلات المحفوظة على هذا المتصفح.'
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div id="view-settings-accessibility" className="space-y-5">
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 rounded-full font-bold text-xs">
            تخصيص المنصة والإعدادات
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            إعدادات النظام والتطبيق والحساب
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            إدارة الحساب وتسجيل الخروج، تنبيهات الجداول، تفضيلات الرصد والعرض، والنسخ الاحتياطي.
          </p>
        </div>

        {currentUser && (
          <button
            type="button"
            id="btn-settings-logout-quick"
            onClick={logout}
            className="h-10 px-4 bg-red-50 hover:bg-red-100 active:scale-98 text-red-700 font-bold text-xs sm:text-sm rounded-xl border border-red-200 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 text-red-600" />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </div>

      {/* 2. Account & Log Out Card (Mandated User Feature) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-900" />
            <span>الحساب الحالي وإدارة الجلسة</span>
          </h3>
          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold">
            جلسة نشطة
          </span>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            {/* User Details Banner */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900">{currentUser.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        currentUser.role === 'manager'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {currentUser.role === 'manager' ? 'مدير المدرسة' : 'معلم معتمد'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                    <span>اسم المستخدم: <strong className="font-mono text-slate-700">{currentUser.username}</strong></span>
                    {currentUser.subject && (
                      <span>المادة: <strong className="text-slate-700">{currentUser.subject}</strong></span>
                    )}
                  </p>
                </div>
              </div>

              {/* Log Out & Switch Account Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {onOpenLoginModal && (
                  <button
                    type="button"
                    onClick={onOpenLoginModal}
                    className="h-10 px-3.5 bg-slate-200 hover:bg-slate-300 active:scale-98 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    تبديل الحساب
                  </button>
                )}
                <button
                  type="button"
                  id="btn-settings-logout"
                  onClick={logout}
                  className="h-10 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>تسجيل الخروج من النظام</span>
                </button>
              </div>
            </div>

            {/* Switch to Another User Account (One-click) */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 mb-2">
                التبديل السريع بين حسابات الكادر المدرسي:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => switchUser(u.id)}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer flex items-center justify-between ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold shadow-2xs'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{u.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {u.role === 'manager' ? 'مدير' : u.subject || 'معلم'}
                      </div>
                    </div>
                    {currentUser.id === u.id && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
            لا توجد جلسة مستخدم نشطة حالياً. يرجى تسجيل الدخول للوصول إلى كافة الصلاحيات.
          </div>
        )}
      </div>

      {/* 3. Teacher Personal Profile & Contact Information */}
      {currentUser && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-900" />
              <span>الملف الشخصي والبيانات المهنية للمعلم</span>
            </h3>
            {profileSaved && (
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded-full font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم حفظ التعديلات بنجاح</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 font-bold text-slate-900 rounded-xl border border-slate-300 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المادة الأساسية المسندة:
                </label>
                <input
                  type="text"
                  value={profileSubject}
                  onChange={e => setProfileSubject(e.target.value)}
                  placeholder="مثال: الرياضيات"
                  className="w-full h-10 px-3 bg-slate-50 font-bold text-slate-900 rounded-xl border border-slate-300 text-xs focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم الهاتف / التواصل:
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full h-10 px-3 bg-slate-50 font-semibold text-slate-900 rounded-xl border border-slate-300 text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="h-9 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                تحديث بيانات الملف الشخصي
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Smart Notifications & Period Reminders Configuration */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600" />
            <span>إعدادات الإشعارات والتنبيهات المدرسية الذكية</span>
          </h3>
          <button
            type="button"
            onClick={handleTestNotification}
            className="h-8 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>إرسال إشعار تجريبي</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Notification 1: 5 Min Before Period */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                تنبيه قبل بداية الحصة (5 دقائق)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إشعار المعلم برقم الحصة والقاعة قبل انطلاقها.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotifyPeriod(!notifyBeforePeriod)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {notifyBeforePeriod ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Notification 2: 10 Min Delayed Attendance */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                تنبيه تأخر رصد الغياب (بعد 10 دقائق)
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تذكير تلقائي في حال عدم اعتماد كشف الفصل بعد بدء الحصة.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotifyDelayed(!notifyAttendanceDelayed)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {notifyAttendanceDelayed ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Notification 3: Consecutive Absence Warning */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                تنبيه الغياب المتكرر للطلاب
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تنبيه فوري للمرشد والمعلم عند غياب الطالب 3 أيام فأكثر.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleNotifyAbsence(!notifyConsecutiveAbsence)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {notifyConsecutiveAbsence ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Display & Visual Ergonomics */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Eye className="w-5 h-5 text-indigo-700" />
          <span>تخصيص العرض والراحة البصرية بالفصول</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Option: Auto Mark Present */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                افتراض حضور جميع الطلاب
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تحديد الكل «حاضر» افتراضياً عند فتح الفصل، لترصد الاستثناء فقط.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleAutoPresent(!autoMarkPresent)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {autoMarkPresent ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Option: Compact Mode */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                النمط المكثف المضغوط
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تصغير المسافات لعرض أكبر عدد من الطلاب بدون الحاجة للتمرير.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleCompactMode(!compactDisplayMode)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {compactDisplayMode ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Option: Large Font */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                تكبير الخط بالقوائم
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                تسهيل القراءة السريعة أثناء الوقوف أمام مقاعد الطلاب في الصف.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleToggleLargeFont(!largeFontMode)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
            >
              {largeFontMode ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 6. Auditory & TTS Assistance Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Volume2 className="w-5 h-5 text-emerald-700" />
          <span>المساعد الصوتي والتأثيرات السمعية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">تشغيل نغمات التأكيد عند اللمس</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                إصدار نغمة خفيفة ومريحة عند رصد الطالب لتأكيد العملية بنجاح.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded-xl cursor-pointer flex-shrink-0"
              aria-label="تبديل نغمات التأكيد"
            >
              {soundEnabled ? (
                <div className="w-11 h-6 bg-emerald-600 rounded-full p-0.5 flex items-center justify-end transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              ) : (
                <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">تجربة المساعد الصوتي باللغة العربية</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                قراءة أسماء الحضور وملخص الفصل صوتياً بنطق عربي واضح.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestSpeech}
              className="h-9 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer flex-shrink-0"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>استماع</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Fast-Load Mode (Weak Connectivity) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>نمط التحميل السريع للفصول ضعيفة التغطية</span>
        </h3>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
              تفعيل نمط خفيف فوري (Fast-Load Mode)
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-xl">
              مثالي للقاعات الدراسية والمعامل المعزولة ذات التغطية الضعيفة. يقوم بتعطيل الحركات التجميلية الثقيلة لتقليل استهلاك البيانات وتسريع الاستجابة للحد الأقصى.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setFastLoadMode(!fastLoadMode)}
            className="p-1 rounded-xl cursor-pointer self-start sm:self-auto flex-shrink-0"
          >
            {fastLoadMode ? (
              <div className="w-11 h-6 bg-blue-600 rounded-full p-0.5 flex items-center justify-end transition">
                <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
              </div>
            ) : (
              <div className="w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start transition">
                <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 8. Local Storage, Backup & PWA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HardDrive className="w-5 h-5 text-blue-800" />
          <span>النسخ الاحتياطي، التخزين، وتثبيت التطبيق</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Backup Download Button */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                تنزيل ملف يحتوي على كافة بيانات الطلاب والجدول وسجلات الحضور.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="w-full h-9 px-3 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل النسخة الآن</span>
            </button>
          </div>

          {/* PWA App Install */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600" />
                <span>تثبيت التطبيق على الجهاز</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                تشغيل المنصة كتطبيق مثبت يعمل بدون متصفح مع دعم كامل بدون إنترنت.
              </p>
            </div>
            {isInstallable ? (
              <button
                type="button"
                onClick={install}
                className="w-full h-9 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>تثبيت كـ تطبيق الآن</span>
              </button>
            ) : isInstalled ? (
              <span className="text-xs font-bold text-emerald-700 text-center py-2">
                ✓ التطبيق مثبت على جهازك بالفعل
              </span>
            ) : (
              <span className="text-xs text-slate-500 text-center py-2 font-medium">
                جاهز للعمل المباشر
              </span>
            )}
          </div>

          {/* Reset Storage */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-red-900 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-red-600" />
                <span>إعادة ضبط البيانات المحلية</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                مسح الذاكرة المؤقتة وإعادة تحميل البيانات الافتراضية للمدرسة.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetStorage}
              className="w-full h-9 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs border border-red-200 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة الضبط الافتراضي</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 pt-2 text-center">
          آخر مزامنة وحفظ محلي: <span className="font-mono text-slate-600">{lastSavedAt}</span>
        </div>
      </div>
    </div>
  );
};
