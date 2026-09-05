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
  Sparkles,
  Menu,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
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
  } = useAttendance();

  const isOnline = useOnlineStatus();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
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
      <div className="flex md:hidden items-center justify-between px-3.5 py-2.5 border-b border-slate-100">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BookOpenCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-right">
            <h1 className="text-sm font-bold text-slate-900 leading-tight">
              منصة الحضور المدرسي
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">مدرسة الملك حسين بن طلال الثانوية للبنين</p>
          </div>
        </div>

        {/* Mobile Right Controls: Status, Bell, Burger Button */}
        <div className="flex items-center gap-1.5">
          {/* Online/Offline indicator */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
            }`}
          >
            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-600" />
            ) : (
              <WifiOff className="w-3 h-3 text-amber-700" />
            )}
            <span>{isOnline ? 'متصل' : 'بدون نت'}</span>
          </span>

          {/* Notifications Bell */}
          <button
            id="btn-mobile-notifications"
            onClick={onOpenNotifications}
            aria-label="التنبيهات المدرسية"
            className="relative h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 border border-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Mobile User Profile Pill */}
          <button
            id="btn-mobile-user-profile"
            type="button"
            onClick={onOpenLoginModal}
            className={`h-9 px-2 rounded-xl border flex items-center gap-1 transition cursor-pointer text-xs font-bold ${
              currentUser?.role === 'manager'
                ? 'bg-purple-50 text-purple-900 border-purple-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
            title="تبديل المستخدم أو تسجيل الدخول"
          >
            {currentUser?.role === 'manager' ? (
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
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
              className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition cursor-pointer"
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

      {/* Desktop Top Utility & Status Row (hidden on mobile, visible on >= md) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2 items-center justify-between gap-2.5 border-b border-slate-100 text-xs">
        {/* Connection & Persistence Status Badges */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Online / Offline Status & Sync Queue */}
          {isOnline ? (
            <span
              id="status-online"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-semibold text-xs"
              title="التطبيق متصل بالشبكة والمزامنة التلقائية مع قاعدة البيانات نشطة"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>متصل (مزامنة فورية)</span>
            </span>
          ) : (
            <span
              id="status-offline"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-400 rounded-full font-bold text-xs animate-pulse"
              title="التطبيق يعمل بدون اتصال ويتم جدولة التغييرات في طابور المزامنة المحلي"
            >
              <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              <span>طابور المزامنة المحلي (Off-line Ready)</span>
            </span>
          )}

          {/* Local Save Indicator */}
          <span
            id="status-saved"
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full font-medium text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            <span>محفوظ ({lastSavedAt})</span>
          </span>

          {/* Fast Load Mode Indicator */}
          {fastLoadMode && (
            <span
              id="status-fast-load"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-900 border border-blue-200 rounded-full font-bold text-xs"
            >
              <Zap className="w-3 h-3 text-blue-700" />
              <span>التحميل السريع</span>
            </span>
          )}
        </div>

        {/* Controls: Sound, Alert test, Notifications */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'كتم التأثيرات الصوتية' : 'تشغيل التأثيرات الصوتية'}
            title={soundEnabled ? 'الصوت مفعّل' : 'الصوت مكتوم'}
            className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Test Alert Simulator Button */}
          <button
            id="btn-simulate-alert"
            onClick={() => triggerTestAlert()}
            title="تجربة تنبيه الحصة الذكي"
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-semibold text-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>تجربة تنبيه</span>
          </button>

          {/* Notifications Bell */}
          <button
            id="btn-notifications"
            onClick={onOpenNotifications}
            aria-label="التنبيهات المدرسية"
            className="relative h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[10px] min-w-[16px] h-[16px] rounded-full flex items-center justify-center px-0.5 border border-white animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Account Controls */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1 border-r border-slate-200 pr-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                  currentUser.role === 'manager'
                    ? 'bg-purple-50 text-purple-900 border-purple-300'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}
              >
                {currentUser.role === 'manager' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
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
                className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <span>تبديل</span>
              </button>

              <button
                id="btn-logout"
                type="button"
                onClick={logout}
                title="تسجيل الخروج"
                className="h-8 w-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 flex items-center justify-center transition cursor-pointer"
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

      {/* Desktop Main Brand Bar & Primary Navigation (hidden on mobile, visible on >= md) */}
      <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2.5 items-center justify-between gap-4">
        {/* Brand & School Details */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
            <BookOpenCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              منصة الحضور المدرسي الذكي
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              مدرسة الملك حسين بن طلال الثانوية للبنين • نظام الرصد الذكي بالاستثناء
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav
          id="desktop-nav-tabs"
          className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200"
          aria-label="القائمة الرئيسية"
        >
          <button
            id="tab-take-attendance"
            onClick={() => setActiveTab('take_attendance')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'take_attendance'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <BookOpenCheck className="w-4 h-4" />
            <span>تسجيل الحضور</span>
          </button>

          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`h-9 px-3.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
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
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
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
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200 hover:text-slate-900'
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
