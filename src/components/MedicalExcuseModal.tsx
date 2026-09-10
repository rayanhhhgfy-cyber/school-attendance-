/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Student } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  User,
  Eye,
} from 'lucide-react';

interface MedicalExcuseModalProps {
  student: Student;
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export const MedicalExcuseModal: React.FC<MedicalExcuseModalProps> = ({
  student,
  date,
  isOpen,
  onClose,
}) => {
  const { getStudentExcuse, uploadMedicalExcuse, deleteMedicalExcuse, currentUser } = useAttendance();
  const excuse = getStudentExcuse(student.id, date);

  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('يرجى اختيار ملف صورة فقط (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMsg('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميجابايت.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      uploadMedicalExcuse(student.id, date, base64, file.name);
      setIsUploading(false);
      setSuccessMsg('تم رفع وحفظ صورة العذر الطبي بنجاح!');
      setTimeout(() => setSuccessMsg(''), 3000);
    };
    reader.onerror = () => {
      setIsUploading(false);
      setErrorMsg('حدث خطأ أثناء قراءة ملف الصورة. يرجى المحاولة مرة أخرى.');
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!excuse?.imageUrl) return;
    const link = document.createElement('a');
    link.href = excuse.imageUrl;
    link.download = `عذر_طبي_${student.name}_${date}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalContent = (
    <div
      id="medical-excuse-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 max-w-lg w-full overflow-hidden flex flex-col my-auto max-h-[90vh] z-50"
      >
        {/* Header */}
        <div className="p-4 bg-blue-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">العذر الطبي للطالب</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                {student.name} • {date}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-4 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {excuse ? (
            /* IF EXCUSE ALREADY EXISTS: DISPLAY PREVIEW, METADATA, & ACTIONS */
            <div className="space-y-4">
              {/* Image View Box */}
              <div className="relative rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-900 overflow-hidden group max-h-[350px] flex items-center justify-center">
                <img
                  src={excuse.imageUrl}
                  alt={`صورة العذر الطبي للطالب ${student.name}`}
                  className="w-full object-contain max-h-[350px]"
                />
              </div>

              {/* Excuse Metadata */}
              <div className="p-3.5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>تم الرفع بواسطة:</span>
                  </span>
                  <strong className="text-slate-900 dark:text-white">{excuse.uploadedBy || 'المعلم'}</strong>
                </div>

                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>تاريخ وقت الرفع:</span>
                  </span>
                  <strong className="text-slate-900 dark:text-white" dir="ltr">{excuse.uploadedAt} ({excuse.date})</strong>
                </div>
              </div>

              {/* Action Buttons: Download, Replace, Delete */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
                {/* Download Button */}
                <button
                  type="button"
                  id="btn-download-excuse-img"
                  onClick={handleDownload}
                  className="h-10 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الصورة</span>
                </button>

                {/* Replace File Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-3 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>تغيير الصورة</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('هل أنت متأكد من حذف هذا العذر الطبي؟')) {
                      deleteMedicalExcuse(excuse.id);
                    }
                  }}
                  className="h-10 px-3 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>حذف العذر</span>
                </button>
              </div>
            </div>
          ) : (
            /* IF NO EXCUSE YET: FILE UPLOAD DROPZONE */
            <div className="space-y-4 text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 dark:border-blue-900/80 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-3xl p-8 transition cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shadow-inner">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                    اضغط هنا لإرفاق صورة العذر الطبي
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    يدعم التقاط أو اختيار صور العذر (PNG, JPG, WEBP)
                  </p>
                </div>
                <button
                  type="button"
                  className="h-9 px-4 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                >
                  اختيار صورة العذر
                </button>
              </div>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-neutral-950 border-t border-slate-100 dark:border-neutral-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </motion.div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};
