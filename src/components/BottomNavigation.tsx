/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { BookOpenCheck, LayoutDashboard, CalendarDays, History, Menu } from 'lucide-react';

interface BottomNavigationProps {
  onOpenBurgerMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenBurgerMenu }) => {
  const { activeTab, setActiveTab } = useAttendance();

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-slate-200 dark:border-neutral-800 shadow-lg safe-area-inset-bottom transition-colors"
      aria-label="شريط التنقل السفلي"
    >
      <div className="grid grid-cols-5 gap-1 p-1 max-w-md mx-auto">
        {/* 1. Take Attendance */}
        <button
          id="mobile-nav-take_attendance"
          type="button"
          onClick={() => setActiveTab('take_attendance')}
          className={`h-12 py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'take_attendance'
              ? 'bg-blue-900 dark:bg-blue-800 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium active:bg-slate-200 dark:active:bg-neutral-700'
          }`}
        >
          <BookOpenCheck
            className={`w-4 h-4 ${
              activeTab === 'take_attendance' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          />
          <span className="text-[10px] font-bold whitespace-nowrap">الرصد</span>
        </button>

        {/* 2. History (السجلات السابقة) */}
        <button
          id="mobile-nav-history"
          type="button"
          onClick={() => setActiveTab('history')}
          className={`h-12 py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-blue-900 dark:bg-blue-800 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium active:bg-slate-200 dark:active:bg-neutral-700'
          }`}
        >
          <History
            className={`w-4 h-4 ${
              activeTab === 'history' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          />
          <span className="text-[10px] font-bold whitespace-nowrap">السجلات</span>
        </button>

        {/* 3. Dashboard */}
        <button
          id="mobile-nav-dashboard"
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`h-12 py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-900 dark:bg-blue-800 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium active:bg-slate-200 dark:active:bg-neutral-700'
          }`}
        >
          <LayoutDashboard
            className={`w-4 h-4 ${
              activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          />
          <span className="text-[10px] font-bold whitespace-nowrap">التقرير</span>
        </button>

        {/* 4. Timetable */}
        <button
          id="mobile-nav-timetable"
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`h-12 py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'timetable'
              ? 'bg-blue-900 dark:bg-blue-800 text-white font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium active:bg-slate-200 dark:active:bg-neutral-700'
          }`}
        >
          <CalendarDays
            className={`w-4 h-4 ${
              activeTab === 'timetable' ? 'text-emerald-400' : 'text-slate-500 dark:text-slate-400'
            }`}
          />
          <span className="text-[10px] font-bold whitespace-nowrap">الجدول</span>
        </button>

        {/* 5. Burger Menu / More */}
        <button
          id="mobile-nav-burger-menu"
          type="button"
          onClick={onOpenBurgerMenu}
          className="h-12 py-1 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 active:bg-slate-200 dark:active:bg-neutral-700"
        >
          <Menu className="w-4 h-4 text-blue-900 dark:text-blue-400" />
          <span className="text-[10px] font-bold whitespace-nowrap text-blue-950 dark:text-blue-300">القائمة</span>
        </button>
      </div>
    </nav>
  );
};
