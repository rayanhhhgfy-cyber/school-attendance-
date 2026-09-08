/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { TakeAttendanceView } from './components/TakeAttendanceView';
import { TodaysAttendanceView } from './components/TodaysAttendanceView';
import { AttendanceHistoryView } from './components/AttendanceHistoryView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { TimetableRemindersView } from './components/TimetableRemindersView';
import { SettingsAccessibilityView } from './components/SettingsAccessibilityView';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { NotificationModal } from './components/NotificationModal';
import { EmergencyLockdownModal } from './components/EmergencyLockdownModal';
import { BurgerMenuDrawer } from './components/BurgerMenuDrawer';
import { LoginModal } from './components/LoginModal';
import { LoginPage } from './components/LoginPage';

const AppContent: React.FC = () => {
  const { activeTab, currentUser } = useAttendance();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // If user is not logged in, render the previous full landing LoginPage
  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* PWA Install Banner */}
      <PWAInstallBanner />

      {/* Application Header */}
      <Header
        onOpenNotifications={() => setIsNotifOpen(true)}
        onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
        onOpenBurgerMenu={() => setIsBurgerOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-32 md:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {activeTab === 'take_attendance' && <TakeAttendanceView />}
            {activeTab === 'todays_attendance' && <TodaysAttendanceView />}
            {activeTab === 'history' && <AttendanceHistoryView />}
            {activeTab === 'dashboard' && (
              <AdminDashboardView onOpenEmergencyModal={() => setIsEmergencyOpen(true)} />
            )}
            {activeTab === 'timetable' && <TimetableRemindersView />}
            {activeTab === 'settings' && (
              <SettingsAccessibilityView onOpenLoginModal={() => setIsLoginModalOpen(true)} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNavigation onOpenBurgerMenu={() => setIsBurgerOpen(true)} />

      {/* Burger Menu Drawer */}
      <BurgerMenuDrawer
        isOpen={isBurgerOpen}
        onClose={() => setIsBurgerOpen(false)}
        onOpenEmergencyModal={() => setIsEmergencyOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Application Modals */}
      <NotificationModal isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <EmergencyLockdownModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        canClose={true}
      />
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
