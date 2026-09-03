/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { ShieldAlert, X, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EmergencyLockdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyLockdownModal: React.FC<EmergencyLockdownModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { settings, toggleEmergencyLockdown } = useAttendance();
  const [reason, setReason] = useState('إجراء احترازي إداري لمنع التعديل على سجلات الحضور');

  if (!isOpen) return null;

  const handleToggle = () => {
    toggleEmergencyLockdown(reason);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-red-600 text-slate-900"
          role="dialog"
          aria-modal="true"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {settings.emergencyLockdown ? 'إدارة الإغلاق الطارئ' : 'زر الإغلاق الطارئ للنظام'}
                </h3>
                <p className="text-xs text-red-700 font-semibold">
                  بروتوكول الطوارئ والأمان المدرسي الفوري
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="إغلاق النافذة"
              className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="py-4 space-y-3">
            {settings.emergencyLockdown ? (
              <div className="p-3.5 bg-red-50 border border-red-400 rounded-xl text-red-900">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base mb-1">
                  <Lock className="w-4 h-4 text-red-700" />
                  <span>النظام حالياً في وضع الإغلاق الطارئ</span>
                </div>
                <p className="text-xs sm:text-sm">
                  تم إيقاف كافة عمليات رصد وتعديل الحضور من قِبل المعلمين. يمكنك الآن فك القفل لإعادة النظام للعمل الطبيعي.
                </p>
                {settings.lockdownTime && (
                  <p className="text-xs font-semibold mt-1.5 text-red-700">
                    توقيت التفعيل: {settings.lockdownTime}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm sm:text-base mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  <span>ماذا يحدث عند تفعيل الإغلاق الطارئ؟</span>
                </div>
                <ul className="text-xs sm:text-sm space-y-1 list-disc list-inside font-medium text-amber-900">
                  <li>قفل فوري لأزرار تحضير الطلاب ومنع أي تعديل من المعلمين.</li>
                  <li>ظهور شريط تحذيري أحمر بارز لجميع المستخدمين.</li>
                  <li>تثبيت الأرقام الحالية للغياب والحضور لمنع التلاعب.</li>
                </ul>
              </div>
            )}

            {!settings.emergencyLockdown && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  سبب الإغلاق الطارئ:
                </label>
                <select
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-100 border border-slate-300 rounded-xl text-slate-900 font-medium text-xs sm:text-sm focus:border-red-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="إجراء احترازي إداري لمنع التعديل على سجلات الحضور">
                    إجراء احترازي إداري لمنع التعديل
                  </option>
                  <option value="حالة طوارئ مدرسية / إخلاء احترازي للمبنى">
                    حالة طوارئ مدرسية / إخلاء احترازي
                  </option>
                  <option value="تدقيق رسمي لسجلات الحضور من الإشراف">
                    تدقيق رسمي لسجلات الحضور من الإشراف
                  </option>
                  <option value="حالة جوية طارئة وانصراف مبكر">
                    حالة جوية طارئة وانصراف مبكر
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {settings.emergencyLockdown ? (
              <button
                type="button"
                onClick={handleToggle}
                className="flex-1 h-11 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>رفع الإغلاق الطارئ وإعادة النظام</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleToggle}
                className="flex-1 h-11 px-4 bg-red-700 hover:bg-red-800 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>تأكيد الإغلاق الطارئ للنظام فوراً</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="h-11 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
