/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWA';
import { ManagerControlCenter } from './ManagerControlCenter';
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
  ShieldAlert,
  KeyRound,
  Sliders,
  Sun,
  Moon,
  Palette,
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
    theme,
    setTheme,
    toggleTheme,
  } = useAttendance();

  const { isInstallable, isInstalled, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Personal Profile Form State
  const [profileName, setProfileName] = useState(currentUser?.name || '');
  const [profileSubject, setProfileSubject] = useState(currentUser?.subject || '');
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || '');
  const [profileUsername, setProfileUsername] = useState(currentUser?.username || '');
  const [profilePassword, setProfilePassword] = useState(currentUser?.password || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [credentialsError, setCredentialsError] = useState('');

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
    setCredentialsError('');

    const newUsername = profileUsername.trim();
    const newPassword = profilePassword.trim();

    if (!newUsername || !newPassword) {
      setCredentialsError('اسم المستخدم وكلمة المرور مطلوبان ولا يمكن تركهما فارغين.');
      return;
    }

    // Check if username is taken by another user
    const existingUser = users.find(
      u => u.id !== currentUser.id && u.username.toLowerCase() === newUsername.toLowerCase()
    );
    if (existingUser) {
      setCredentialsError('اسم المستخدم هذا مسجل مسبقاً لمستخدم آخر. يرجى اختيار اسم مستخدم مختلف.');
      return;
    }

    updateUserAccount(currentUser.id, {
      name: profileName.trim() || currentUser.name,
      subject: profileSubject.trim() || currentUser.subject,
      phone: profilePhone.trim() || currentUser.phone,
      username: newUsername,
      password: newPassword,
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
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div>
          <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs">
            تخصيص المنصة والإعدادات
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            إعدادات النظام والتطبيق والحساب
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            إدارة الحساب وتسجيل الخروج، تنبيهات الجداول، تفضيلات الرصد والعرض، والنسخ الاحتياطي.
          </p>
        </div>

        {currentUser && (
          <button
            type="button"
            id="btn-settings-logout-quick"
            onClick={logout}
            className="h-10 px-4 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-98 text-red-700 dark:text-red-300 font-bold text-xs sm:text-sm rounded-xl border border-red-200 dark:border-red-900/60 flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>تسجيل الخروج</span>
          </button>
        )}
      </div>

      {/* MANAGER FULL CONTROL PANEL IN SETTINGS (Visible to Manager rayyan) */}
      {currentUser?.role === 'manager' && (
        <div className="space-y-4 bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-3xl border border-purple-200 dark:border-purple-900/40 shadow-xs">
          <div className="flex items-center gap-2 px-3 py-1 bg-purple-900 text-white rounded-xl text-xs font-bold w-fit">
            <ShieldAlert className="w-4 h-4 text-amber-300" />
            <span>لوحة التحكم الكاملة لمدير المدرسة (أ. ريان)</span>
          </div>

          {/* System Feature Toggles for Manager */}
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
                  id="toggle-sms-alerts-settings"
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
                  id="toggle-pause-holidays-settings"
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
            </div>
          </div>

          {/* Embedded Full Credentials & Teacher Management Component */}
          <ManagerControlCenter />
        </div>
      )}

      {/* 2. Account & Log Out Card (Mandated User Feature) */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-900 dark:text-blue-400" />
            <span>الحساب الحالي وإدارة الجلسة</span>
          </h3>
          <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-full font-bold">
            جلسة نشطة
          </span>
        </div>

        {currentUser ? (
          <div className="space-y-4">
            {/* User Details Banner */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-lg shadow-xs flex-shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">{currentUser.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        currentUser.role === 'manager'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300'
                      }`}
                    >
                      {currentUser.role === 'manager' ? 'مدير المدرسة' : 'معلم معتمد'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>اسم المستخدم: <strong className="font-mono text-slate-700 dark:text-slate-200">{currentUser.username}</strong></span>
                    {currentUser.subject && (
                      <span>المادة: <strong className="text-slate-700 dark:text-slate-200">{currentUser.subject}</strong></span>
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
                    className="h-10 px-3.5 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 active:scale-98 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
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

          </div>
        ) : (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            لا توجد جلسة مستخدم نشطة حالياً. يرجى تسجيل الدخول للوصول إلى كافة الصلاحيات.
          </div>
        )}
      </div>

      {/* 3. Teacher Personal Profile & Contact Information */}
      {currentUser && (
        <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-900 dark:text-blue-400" />
              <span>الملف الشخصي والبيانات المهنية للمعلم</span>
            </h3>
            {profileSaved && (
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs rounded-full font-bold flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>تم حفظ التعديلات بنجاح</span>
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            {credentialsError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-900 dark:text-red-300 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>{credentialsError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={e => setProfileName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-neutral-950 font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-neutral-700 text-xs focus:bg-white dark:focus:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  المادة الأساسية المسندة:
                </label>
                <input
                  type="text"
                  value={profileSubject}
                  onChange={e => setProfileSubject(e.target.value)}
                  placeholder=""
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-neutral-950 font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-neutral-700 text-xs focus:bg-white dark:focus:bg-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الهاتف / التواصل:
                </label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={e => setProfilePhone(e.target.value)}
                  placeholder=""
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-neutral-950 font-semibold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-neutral-700 text-xs focus:bg-white dark:focus:bg-neutral-900"
                />
              </div>
            </div>

            {/* Credentials Card (Username & Password) */}
            <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>تغيير اسم المستخدم وكلمة المرور الخاصة بالحساب</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم المستخدم (Username):
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={profileUsername}
                    onChange={e => setProfileUsername(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-900 font-mono font-bold text-blue-900 dark:text-blue-300 rounded-xl border border-slate-300 dark:border-neutral-700 text-xs text-left"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    كلمة المرور (Password):
                  </label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={profilePassword}
                    onChange={e => setProfilePassword(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-neutral-900 font-mono font-bold text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-neutral-700 text-xs text-left"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                id="btn-save-teacher-credentials"
                className="h-9 px-5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>تحديث البيانات وكلمة المرور</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Smart Notifications & Period Reminders Configuration */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-neutral-800 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <span>إعدادات الإشعارات والتنبيهات المدرسية الذكية</span>
          </h3>
          <button
            type="button"
            onClick={handleTestNotification}
            className="h-8 px-3 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>إرسال إشعار تجريبي</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Notification 1: 5 Min Before Period */}
          <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                تنبيه قبل بداية الحصة (5 دقائق)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Notification 2: 10 Min Delayed Attendance */}
          <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                تنبيه تأخر رصد الغياب (بعد 10 دقائق)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>

          {/* Notification 3: Consecutive Absence Warning */}
          <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                تنبيه الغياب المتكرر للطلاب
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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
                <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                  <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 5. Display & Visual Ergonomics */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-5 transition-colors">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-3">
          <Palette className="w-5 h-5 text-indigo-700 dark:text-indigo-400" />
          <span>تخصيص المظهر ونمط الألوان (Dark & Light Theme)</span>
        </h3>

        {/* Theme Switcher Cards (#000000 vs #FFFFFF) */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-amber-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span>نمط العرض الحالي: {theme === 'dark' ? 'الوضع الداكن الأسود (#000000)' : 'الوضع الفاتح الأبيض (#FFFFFF)'}</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                يمكنك التبديل الفوري بين المظهر الأبيض النقي (#FFFFFF) والمظهر الليلي الداكن العميق (#000000) لحماية العين وتوفير الطاقة.
              </p>
            </div>

            <button
              id="settings-theme-quick-toggle"
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-2 self-start sm:self-auto bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-900 dark:text-white border-slate-300 dark:border-neutral-700 shadow-2xs"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>التحويل للفاتح (#FFFFFF)</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-800 dark:text-slate-200" />
                  <span>التحويل للداكن (#000000)</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Light Theme Selection Card */}
            <button
              type="button"
              id="btn-select-theme-light"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer relative flex flex-col justify-between h-32 ${
                theme === 'light'
                  ? 'border-blue-600 bg-white shadow-md ring-2 ring-blue-100'
                  : 'border-slate-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900 hover:border-slate-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white block">الوضع الفاتح</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">كود اللون: #FFFFFF</span>
                  </div>
                </div>
                {theme === 'light' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                    مفعّل الآن
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-slate-300 shadow-2xs" />
                <span>أرضية بيضاء ناصعة وخطوط واضحة للاستخدام الصباحي</span>
              </div>
            </button>

            {/* Dark Theme Selection Card */}
            <button
              type="button"
              id="btn-select-theme-dark"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border-2 text-right transition cursor-pointer relative flex flex-col justify-between h-32 ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-[#0d0d0d] text-white shadow-md ring-2 ring-indigo-950'
                  : 'border-slate-300 dark:border-neutral-800 bg-[#121212] text-slate-200 hover:border-slate-400 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 text-amber-400 flex items-center justify-center border border-neutral-700">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block">الوضع الداكن</span>
                    <span className="text-[11px] font-mono text-slate-400">كود اللون: #000000</span>
                  </div>
                </div>
                {theme === 'dark' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                    مفعّل الآن
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-800 text-[11px] text-slate-400">
                <span className="w-4 h-4 rounded-full bg-[#000000] border border-neutral-700 shadow-2xs" />
                <span>أرضية سوداء نقية لتقليل إجهاد العين وتوفير شحن البطارية</span>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* 7. Fast-Load Mode (Weak Connectivity) */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <span>نمط التحميل السريع للفصول ضعيفة التغطية</span>
        </h3>

        <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              تفعيل نمط خفيف فوري (Fast-Load Mode)
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
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
              <div className="w-11 h-6 bg-slate-300 dark:bg-neutral-700 rounded-full p-0.5 flex items-center justify-start transition">
                <div className="w-5 h-5 bg-white rounded-full shadow-xs" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* 8. Local Storage, Backup & PWA */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-neutral-800 pb-3">
          <HardDrive className="w-5 h-5 text-blue-800 dark:text-blue-400" />
          <span>النسخ الاحتياطي، التخزين، وتثبيت التطبيق</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Backup Download Button */}
          <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>تثبيت التطبيق على الجهاز</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
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
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 text-center py-2">
                ✓ التطبيق مثبت على جهازك بالفعل
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400 text-center py-2 font-medium">
                جاهز للعمل المباشر
              </span>
            )}
          </div>


        {/* Reset Storage */}
          <div className="p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-red-900 dark:text-red-300 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>إعادة ضبط البيانات المحلية</span>
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                مسح الذاكرة المؤقتة وإعادة تحميل البيانات الافتراضية للمدرسة.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetStorage}
              className="w-full h-9 px-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 font-bold rounded-xl text-xs border border-red-200 dark:border-red-900/60 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة الضبط الافتراضي</span>
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 dark:text-slate-500 pt-2 text-center">
          آخر مزامنة وحفظ محلي: <span className="font-mono text-slate-600 dark:text-slate-300">{lastSavedAt}</span>
        </div>
      </div>

      {/* PROMINENT MOBILE & DESKTOP DOWNLOAD PWA BUTTON AT THE VERY BOTTOM */}
      <div className="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl shadow-lg border border-blue-800 space-y-3 text-center my-4">
        <div className="flex items-center justify-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-black">تحميل وتثبيت تطبيق المدرسة (PWA)</h3>
        </div>
        <p className="text-xs sm:text-sm text-blue-100 max-w-xl mx-auto opacity-90">
          قم بتنزيل المنصة كتطبيق مثبت على شاشة هاتفك الذكي أو جهاز الحاسوب للوصول السريع بدون حوارات المتصفح وبدعم أوفلاين كامل.
        </p>

        <button
          type="button"
          id="btn-download-pwa-bottom"
          onClick={install}
          disabled={!isInstallable && !isInstalled}
          className="w-full sm:w-auto h-12 px-8 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black rounded-2xl text-sm sm:text-base transition shadow-md inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mx-auto"
        >
          <Download className="w-5 h-5 text-slate-950" />
          <span>
            {isInstalled
              ? '✓ التطبيق مثبت على جهازك بالفعل'
              : isInstallable
              ? 'تحميل وتثبيت التطبيق الآن'
              : 'تطبيق المدرسة جاهز ومثبت'}
          </span>
        </button>
      </div>
    </div>
  );
};
