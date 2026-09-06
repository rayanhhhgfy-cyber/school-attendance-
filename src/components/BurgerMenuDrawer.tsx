/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { useOnlineStatus } from '../hooks/usePWA';
import {
  X,
  BookOpenCheck,
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  Volume2,
  VolumeX,
  ShieldAlert,
  Sparkles,
  Wifi,
  WifiOff,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  UserCheck,
  LogOut,
  LogIn,
  Sun,
  Moon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BurgerMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmergencyModal: () => void;
  onOpenLoginModal: () => void;
}

export const BurgerMenuDrawer: React.FC<BurgerMenuDrawerProps> = ({
  isOpen,
  onClose,
  onOpenEmergencyModal,
  onOpenLoginModal,
}) => {
  const {
    activeTab,
    setActiveTab,
    classes,
    selectedClassId,
    setSelectedClassId,
    soundEnabled,
    setSoundEnabled,
    settings,
    triggerTestAlert,
    lastSavedAt,
    currentUser,
    logout,
    theme,
    toggleTheme,
  } = useAttendance();

  const isOnline = useOnlineStatus();

  const handleNavClick = (tab: 'take_attendance' | 'dashboard' | 'timetable' | 'settings') => {
    setActiveTab(tab);
    onClose();
  };

  const navItems = [
    {
      id: 'take_attendance' as const,
      title: 'تسجيل الحضور',
      desc: 'رصد الحضور السريع بالاستثناء حسب الحصص',
      icon: BookOpenCheck,
    },
    {
      id: 'dashboard' as const,
      title: 'التقرير اليومي والمتابعة',
      desc: 'إحصائيات ونسب الحضور وموقف الفصول',
      icon: LayoutDashboard,
    },
    {
      id: 'timetable' as const,
      title: 'جدول الحصص والتنبيهات',
      desc: 'الجدول الأسبوعي والتذكير الذكي قبل الحصة',
      icon: CalendarDays,
    },
    {
      id: 'settings' as const,
      title: 'إعدادات المنصة',
      desc: 'خيارات النظام والحفظ دون اتصال',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
            aria-label="إغلاق القائمة الجانبية"
          />

          {/* Drawer Panel - slides from right in RTL */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="relative mr-auto w-full max-w-xs sm:max-w-sm bg-white dark:bg-black h-full shadow-2xl z-10 flex flex-col justify-between border-l border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white overflow-y-auto"
          >
            {/* Drawer Header */}
            <div>
              <div className="p-4 border-b border-slate-100 dark:border-neutral-800 flex items-center justify-between bg-slate-50 dark:bg-neutral-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
                    <BookOpenCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      منصة الحضور المدرسي
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">مدرسة الملك حسين بن طلال الثانوية للبنين</p>
                  </div>
                </div>

                <button
                  id="btn-close-burger-menu"
                  type="button"
                  onClick={onClose}
                  aria-label="إغلاق القائمة"
                  className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Account Card inside Burger Drawer */}
              <div className="p-3.5 bg-slate-50 dark:bg-neutral-900/90 border-b border-slate-200 dark:border-neutral-800">
                {currentUser ? (
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          currentUser.role === 'manager'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                      >
                        {currentUser.role === 'manager' ? (
                          <ShieldCheck className="w-5 h-5 text-purple-700 dark:text-purple-400" />
                        ) : (
                          <UserCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                            {currentUser.name}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              currentUser.role === 'manager'
                                ? 'bg-purple-200 dark:bg-purple-900/60 text-purple-900 dark:text-purple-200'
                                : 'bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200'
                            }`}
                          >
                            {currentUser.role === 'manager' ? 'مدير' : 'معلم'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">
                          {currentUser.role === 'manager'
                            ? 'صلاحيات إدارية كاملة'
                            : currentUser.subject || 'معلم الحصة'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenLoginModal();
                        }}
                        className="h-8 px-2.5 bg-white dark:bg-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-neutral-700 transition cursor-pointer"
                        title="تبديل الحساب"
                      >
                        تبديل
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          onClose();
                        }}
                        className="h-8 w-8 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900/50 flex items-center justify-center transition cursor-pointer"
                        title="تسجيل الخروج"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLoginModal();
                    }}
                    className="w-full h-10 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>تسجيل الدخول للمنصة</span>
                  </button>
                )}
              </div>

              {/* Quick Class Switcher inside Burger Menu */}
              <div className="p-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  اختيار الفصل الحالي:
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => {
                    setSelectedClassId(e.target.value);
                    setActiveTab('take_attendance');
                    onClose();
                  }}
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden cursor-pointer"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentCount} طالب)
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Items */}
              <div className="p-3 space-y-1.5">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1">أقسام المنصة</div>
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`burger-nav-${item.id}`}
                      type="button"
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full p-3 rounded-xl flex items-center justify-between text-right transition cursor-pointer ${
                        isActive
                          ? 'bg-blue-900 text-white shadow-xs font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 active:bg-slate-200 dark:active:bg-neutral-700 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isActive ? 'bg-blue-800 text-emerald-400' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-sm block font-bold leading-tight">{item.title}</span>
                          <span
                            className={`text-[11px] block mt-0.5 ${
                              isActive ? 'text-blue-200' : 'text-slate-400 dark:text-slate-400'
                            }`}
                          >
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronLeft
                        className={`w-4 h-4 ${isActive ? 'text-blue-200' : 'text-slate-400'}`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Quick Actions & Tools */}
              <div className="p-3 space-y-2 border-t border-slate-100 dark:border-neutral-800">
                <div className="text-[11px] font-bold text-slate-400 px-2 py-1">أدوات سريعة ومظهر</div>

                {/* Dark/Light Theme Toggle */}
                <button
                  id="burger-toggle-theme"
                  type="button"
                  onClick={toggleTheme}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    )}
                    <span>نمط العرض والمظهر</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      theme === 'dark'
                        ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                        : 'bg-blue-50 text-blue-900 border border-blue-200'
                    }`}
                  >
                    {theme === 'dark' ? 'داكن (#000000)' : 'فاتح (#FFFFFF)'}
                  </span>
                </button>

                {/* Sound Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                    )}
                    <span>المؤثرات الصوتية التفاعلية</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      soundEnabled
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {soundEnabled ? 'مفعلة' : 'مكتومة'}
                  </span>
                </button>

                {/* Test Alert */}
                <button
                  type="button"
                  onClick={() => {
                    triggerTestAlert();
                    onClose();
                  }}
                  className="w-full h-10 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200 cursor-pointer transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>تجربة تنبيه الحصة الذكي</span>
                </button>

                {/* Emergency Lockdown */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenEmergencyModal();
                  }}
                  className={`w-full h-10 px-3 rounded-xl flex items-center gap-2 text-xs font-bold cursor-pointer transition ${
                    settings.emergencyLockdown
                      ? 'bg-red-700 text-white'
                      : 'bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-900/60'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span>
                    {settings.emergencyLockdown
                      ? '⚠️ فك الإغلاق الطارئ'
                      : 'إجراء الإغلاق الطارئ للنظام'}
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Footer: Status and Meta */}
            <div className="p-4 border-t border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  {isOnline ? (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">متصل بالإنترنت</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-amber-700 dark:text-amber-400 font-semibold">وضع عدم الاتصال</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>محفوظ ({lastSavedAt})</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                نظام الرصد الذكي بالاستثناء • إصدار PWA المحمول
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
