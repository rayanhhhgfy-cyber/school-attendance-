/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { BookOpenCheck, LayoutDashboard, CalendarDays, Menu } from 'lucide-react';

interface BottomNavigationProps {
  onOpenBurgerMenu: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ onOpenBurgerMenu }) => {
  const { activeTab, setActiveTab } = useAttendance();

  return (
    <nav
      id="mobile-bottom-navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg safe-area-inset-bottom"
      aria-label="شريط التنقل السفلي"
    >
      <div className="grid grid-cols-4 gap-1 p-1 max-w-md mx-auto">
        {/* 1. Take Attendance */}
        <button
          id="mobile-nav-take_attendance"
          type="button"
          onClick={() => setActiveTab('take_attendance')}
          className={`h-12 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'take_attendance'
              ? 'bg-blue-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 font-medium active:bg-slate-200'
          }`}
        >
          <BookOpenCheck
            className={`w-5 h-5 ${
              activeTab === 'take_attendance' ? 'text-emerald-400' : 'text-slate-500'
            }`}
          />
          <span className="text-[11px] font-bold whitespace-nowrap">الرصد</span>
        </button>

        {/* 2. Dashboard */}
        <button
          id="mobile-nav-dashboard"
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`h-12 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-blue-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 font-medium active:bg-slate-200'
          }`}
        >
          <LayoutDashboard
            className={`w-5 h-5 ${
              activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-500'
            }`}
          />
          <span className="text-[11px] font-bold whitespace-nowrap">التقرير</span>
        </button>

        {/* 3. Timetable */}
        <button
          id="mobile-nav-timetable"
          type="button"
          onClick={() => setActiveTab('timetable')}
          className={`h-12 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
            activeTab === 'timetable'
              ? 'bg-blue-900 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 font-medium active:bg-slate-200'
          }`}
        >
          <CalendarDays
            className={`w-5 h-5 ${
              activeTab === 'timetable' ? 'text-emerald-400' : 'text-slate-500'
            }`}
          />
          <span className="text-[11px] font-bold whitespace-nowrap">الجدول</span>
        </button>

        {/* 4. Burger Menu / More */}
        <button
          id="mobile-nav-burger-menu"
          type="button"
          onClick={onOpenBurgerMenu}
          className="h-12 py-1 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer text-slate-600 hover:bg-slate-100 active:bg-slate-200"
        >
          <Menu className="w-5 h-5 text-blue-900" />
          <span className="text-[11px] font-bold whitespace-nowrap text-blue-950">القائمة</span>
        </button>
      </div>
    </nav>
  );
};

