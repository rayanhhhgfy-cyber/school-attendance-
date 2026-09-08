/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { useOnlineStatus } from '../hooks/usePWA';
import {
  CheckCircle2,
  Wifi,
  WifiOff,
  Bell,
  Volume2,
  VolumeX,
  AlertTriangle,
  Zap,
  BookOpenCheck,
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  History,
  Sparkles,
  Menu,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenEmergencyModal: () => void;
  onOpenBurgerMenu: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenEmergencyModal,
  onOpenBurgerMenu,
  onOpenLoginModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    settings,
    fastLoadMode,
    soundEnabled,
    setSoundEnabled,
    notifications,
    lastSavedAt,
    triggerTestAlert,
    currentUser,
    logout,
    theme,
    toggleTheme,
  } = useAttendance();

  const isOnline = useOnlineStatus();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#000000] border-b border-slate-200 dark:border-neutral-800 shadow-xs transition-colors duration-200">
      {/* Emergency Lockdown Alert Bar */}
      {settings.emergencyLockdown && (
        <div
          id="emergency-lockdown-banner"
          className="bg-red-700 text-white px-4 py-2 border-b border-red-800 flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <p className="font-bold text-xs sm:text-sm">
              ⚠️ تنبيه: تم تفعيل حظر التعديل على سجلات الحضور
            </p>
          </div>
          <button
            onClick={onOpenEmergencyModal}
            className="h-7 px-2.5 bg-white text-red-800 hover:bg-red-50 font-bold rounded-lg text-xs transition shadow-xs cursor-pointer whitespace-nowrap"
          >
            إدارة الطوارئ
          </button>
        </div>
      )}

      {/* Mobile Streamlined Header (< md) */}
      <div className="flex md:hidden items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-neutral-800">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BookOpenCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
              منصة الحضور المدرسي
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">مدرسة الملك حسين بن طلال الثانوية للبنين</p>
          </div>
        </div>

        {/* Mobile Right Controls: Status, Bell, Burger Button */}
        <div className="flex items-center gap-1.5">
          {/* Online/Offline indicator */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isOnline
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-400 dark:border-amber-800 animate-pulse'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            )}
            <span>{isOnline ? 'متصل' : 'بدون نت'}</span>
          </span>

          {/* Notifications Bell */}
          <button
            id="btn-mobile-notifications"
            onClick={onOpenNotifications}
            aria-label="التنبيهات المدرسية"
            className="relative h-9 w-9 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            id="btn-mobile-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Mobile User Profile Pill */}
          <button
            id="btn-mobile-user-profile"
            type="button"
            onClick={onOpenLoginModal}
            className={`h-9 px-2 rounded-xl border flex items-center gap-1 transition cursor-pointer text-xs font-bold ${
              currentUser?.role === 'manager'
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
            }`}
            title="تبديل المستخدم أو تسجيل الدخول"
          >
            {currentUser?.role === 'manager' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            )}
            <span className="max-w-[60px] truncate">{currentUser ? currentUser.name.split(' ')[0] : 'دخول'}</span>
          </button>

          {/* Mobile Logout Button */}
          {currentUser && (
            <button
              id="btn-mobile-logout"
              type="button"
              onClick={logout}
              title="تسجيل الخروج والعودة لصفحة الدخول"
              className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center justify-center transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

          {/* Burger Menu Button */}
          <button
            id="btn-mobile-burger-menu"
            type="button"
            onClick={onOpenBurgerMenu}
            aria-label="فتح القائمة الرئيسية"
            className="h-9 w-9 rounded-xl bg-blue-900 hover:bg-blue-800 active:scale-95 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Top Utility & Status Row */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2 items-center justify-between gap-2.5 border-b border-slate-100 dark:border-neutral-800 text-xs">
        <div className="flex items-center flex-wrap gap-2">
          {isOnline ? (
            <span
              id="status-online"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded-full font-semibold text-xs"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>متصل (مزامنة فورية)</span>
            </span>
          ) : (
            <span
              id="status-offline"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-400 dark:border-amber-800 rounded-full font-bold text-xs animate-pulse"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>طابور المزامنة المحلي (Off-line Ready)</span>
            </span>
          )}

          <span
            id="status-saved"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-neutral-700 rounded-full font-medium text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>محفوظ ({lastSavedAt})</span>
          </span>

          {fastLoadMode && (
            <span
              id="status-fast-load"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 rounded-full font-bold text-xs"
            >
              <Zap className="w-3 h-3 text-blue-700 dark:text-blue-400" />
              <span>التحميل السريع</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="btn-toggle-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'كتم التأثيرات الصوتية' : 'تشغيل التأثيرات الصوتية'}
            title={soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}
            className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          <button
            id="btn-simulate-alert"
            onClick={() => triggerTestAlert()}
            title="تجربة تنبيه الحصة الذكي"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900 font-semibold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>تجربة تنبيه</span>
          </button>

          <button
            id="btn-notifications"
            onClick={onOpenNotifications}
            aria-label="التنبيهات المدرسية"
            className="relative h-8 w-8 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 flex items-center justify-center transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 border border-white dark:border-neutral-900 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            id="btn-desktop-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            title={theme === 'dark' ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-semibold transition cursor-pointer"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px]">الوضع الفاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-[11px]">الوضع الداكن</span>
              </>
            )}
          </button>

          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-r border-slate-200 dark:border-neutral-800 pr-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                  currentUser.role === 'manager'
                    ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 border-purple-300 dark:border-purple-800'
                    : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800'
                }`}
              >
                {currentUser.role === 'manager' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                )}
                <span>{currentUser.name}</span>
                <span className="text-[10px] opacity-75 font-normal">
                  ({currentUser.role === 'manager' ? 'مدير' : currentUser.subject || 'معلم'})
                </span>
              </div>

              <button
                id="btn-switch-user"
                type="button"
                onClick={onOpenLoginModal}
                title="تبديل الحساب الحالي"
                className="h-8 px-2.5 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-neutral-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <span>تبديل</span>
              </button>

              <button
                id="btn-logout"
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center justify-center transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              id="btn-login"
              type="button"
              onClick={onOpenLoginModal}
              className="h-8 px-3 rounded-lg bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>تسجيل الدخول</span>
            </button>
          )}
        </div>
      </div>

      {/* Desktop Main Brand Bar & Primary Navigation */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-tight">
              منصة الحضور المدرسي الذكي
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {settings.schoolName || 'مدرسة الملك حسين بن طلال الثانوية للبنين'} • نظام الرصد الذكي بالاستثناء
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav
          id="desktop-nav-tabs"
          className="flex items-center gap-1.5 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200 dark:border-neutral-800"
          aria-label="القائمة الرئيسية"
        >
          <button
            id="tab-take-attendance"
            onClick={() => setActiveTab('take_attendance')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'take_attendance'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>تسجيل الحضور</span>
          </button>

          <button
            id="tab-todays-attendance"
            onClick={() => setActiveTab('todays_attendance')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'todays_attendance'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>حضور اليوم</span>
          </button>

          <button
            id="tab-history"
            onClick={() => setActiveTab('history')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>السجلات السابقة</span>
          </button>

          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>التقرير والمتابعة</span>
          </button>

          <button
            id="tab-timetable"
            onClick={() => setActiveTab('timetable')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'timetable'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>الجدول والتنبيهات</span>
          </button>

          <button
            id="tab-settings"
            onClick={() => setActiveTab('settings')}
            className={`h-9 px-3 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-blue-900 dark:bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>الإعدادات</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
