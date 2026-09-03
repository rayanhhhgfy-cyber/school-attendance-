/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, X, Volume2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { speakArabic } from '../utils/audio';

interface ConfirmationModalProps {
  isOpen: boolean;
  classNameTitle: string;
  periodNumber: number;
  date: string;
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  classNameTitle,
  periodNumber,
  date,
  totalStudents,
  presentCount,
  absentCount,
  lateCount,
  excusedCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleSpeakSummary = () => {
    const summaryText = `كشف حضور ${classNameTitle}، الحصة رقم ${periodNumber}. إجمالي الطلاب ${totalStudents}. الحضور ${presentCount}. الغياب ${absentCount}. المتأخرون ${lateCount}. والأعذار ${excusedCount}.`;
    speakArabic(summaryText);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-900 overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 id="modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                  تأكيد كشف الحضور والغياب
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {classNameTitle} • الحصة {periodNumber} • {date}
                </p>
              </div>
            </div>

            <button
              onClick={onCancel}
              aria-label="إغلاق النافذة"
              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Guidance Button */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSpeakSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200 font-semibold text-xs transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-blue-700" />
              <span>استماع للملخص</span>
            </button>
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4">
            {/* Present */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-emerald-800 block mb-0.5">
                الطلاب الحضور
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-emerald-700 block">
                {presentCount}
              </span>
              <span className="text-[11px] text-emerald-800 font-medium">
                ({totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 100}%)
              </span>
            </div>

            {/* Absent */}
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-red-800 block mb-0.5">
                الغياب
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-red-700 block">
                {absentCount}
              </span>
              <span className="text-[11px] text-red-800 font-medium">طالب</span>
            </div>

            {/* Late */}
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-amber-800 block mb-0.5">
                المتأخرين
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-amber-700 block">
                {lateCount}
              </span>
              <span className="text-[11px] text-amber-800 font-medium">طالب</span>
            </div>

            {/* Excused */}
            <div className="bg-blue-50 border border-blue-300 rounded-xl p-3 text-center">
              <span className="text-xs font-semibold text-blue-800 block mb-0.5">
                عذر طبي
              </span>
              <span className="text-2xl sm:text-3xl font-bold text-blue-700 block">
                {excusedCount}
              </span>
              <span className="text-[11px] text-blue-800 font-medium">طالب</span>
            </div>
          </div>

          {/* Total Students Summary */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              إجمالي طلاب الفصل المقيدين:
            </span>
            <span className="text-base font-bold text-slate-900">
              {totalStudents} طالب
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              id="btn-confirm-save-modal"
              type="button"
              onClick={onConfirm}
              className="flex-1 h-11 px-4 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-bold text-sm sm:text-base rounded-xl flex items-center justify-center gap-2 transition shadow-md cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>تأكيد وحفظ الكشف</span>
            </button>

            <button
              id="btn-cancel-save-modal"
              type="button"
              onClick={onCancel}
              className="h-11 px-4 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 font-semibold text-sm rounded-xl flex items-center justify-center transition cursor-pointer"
            >
              مراجعة وتعديل
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
