/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Bell, X, Trash2, CheckCircle2, Clock, AlertTriangle, Info, BookOpenCheck } from 'lucide-react';
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
  } = useAttendance();

  if (!isOpen) return null;

  const handleAction = (classId?: string) => {
    if (classId) {
      setSelectedClassId(classId);
      setSelectedPeriod(1);
      setActiveTab('take_attendance');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl border border-slate-200 text-slate-900 max-h-[85vh] flex flex-col"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                التنبيهات المدرسية ({notifications.length})
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllNotifications}
                  title="مسح كافة التنبيهات"
                  className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                aria-label="إغلاق النافذة"
                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
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
                      ? 'bg-amber-50 border-amber-200'
                      : n.type === 'reminder'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      {n.type === 'warning' ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      ) : n.type === 'reminder' ? (
                        <Clock className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <h4 className="font-bold text-slate-900">{n.title}</h4>
                        <p className="text-slate-700 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[11px] text-slate-400 block mt-1">{n.time}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="text-slate-400 hover:text-slate-700 p-0.5"
                      aria-label="حذف التنبيه"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {n.classId && (
                    <div className="mt-2.5 pt-2 border-t border-blue-200 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAction(n.classId)}
                        className="h-8 px-3 bg-blue-900 hover:bg-blue-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
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
