/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Bell, X, Trash2, CheckCircle2, Clock, AlertTriangle, Info, BookOpenCheck, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const {
    notifications,
    dismissNotification,
    clearAllNotifications,
    setSelectedClassId,
    setSelectedPeriod,
    setActiveTab,
    requestNotificationPermission,
  } = useAttendance();

  const [permGranted, setPermGranted] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted';
  });

  if (!isOpen) return null;

  const handleAction = (classId?: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setSelectedPeriod(1);
      setActiveTab('take_attendance');
      onClose();
    }
  };

  const handleEnablePush = async () => {
    const granted = await requestNotificationPermission();
    setPermGranted(granted);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-white max-h-[85vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                التنبيهات المدرسية ({notifications.length})
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  title="مسح كافة التنبيهات"
                  className="p-1.5 text-slate-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="إغلاق النافذة"
                className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Browser Push Permission Banner */}
          {!permGranted && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                <BellRing className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>إشعارات المتصفح والسطح المنبثقة (Push Notifications) غير مفعلة</span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                className="h-8 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition cursor-pointer flex-shrink-0"
              >
                تفعيل الإشعارات
              </button>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-10 h-10 mx-auto text-slate-400 mb-1.5" />
                <p className="text-sm font-bold">لا توجد تنبيهات جديدة حالياً</p>
                <p className="text-xs text-slate-400">كل السجلات والحصص محدثة بانتظام.</p>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border transition text-xs sm:text-sm ${
                    n.type === 'warning'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                      : n.type === 'reminder'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60'
                      : 'bg-slate-50 dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      {n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      ) : n.type === 'reminder' ? (
                        <Clock className="w-4 h-4 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-600 dark:text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{n.title}</h4>
                        <p className="text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[11px] text-slate-400 block mt-1">{n.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                      aria-label="حذف التنبيه"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {n.classId && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200 dark:border-blue-900/60 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAction(n.classId)}
                        className="h-8 px-3 bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <BookOpenCheck className="w-3.5 h-3.5" />
                        <span>فتح كشف الحضور</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
