/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, AttendanceStatus } from '../types';
import {
  Check,
  X,
  Clock,
  FileText,
  AlertCircle,
  MessageSquarePlus,
  HeartHandshake,
  Edit2,
  Trash2,
  Phone,
} from 'lucide-react';

interface StudentCardProps {
  student: Student;
  currentStatus: AttendanceStatus;
  note?: string;
  isLocked: boolean;
  fastLoadMode: boolean;
  onStatusChange: (status: AttendanceStatus) => void;
  onSaveNote: (note: string) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (student: Student) => void;
  onContactGuardian?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  currentStatus,
  note,
  isLocked,
  fastLoadMode,
  onStatusChange,
  onSaveNote,
  onEditStudent,
  onDeleteStudent,
  onContactGuardian,
}) => {
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [tempNote, setTempNote] = useState(note || '');

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold text-xs sm:text-sm">
            <Check className="w-3.5 h-3.5 text-emerald-700" />
            <span>حاضر</span>
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-900 border border-red-300 rounded-full font-bold text-xs sm:text-sm">
            <X className="w-3.5 h-3.5 text-red-700" />
            <span>غائب اليوم</span>
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>متأخر</span>
          </span>
        );
      case 'excused':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full font-bold text-xs sm:text-sm">
            <FileText className="w-3.5 h-3.5 text-blue-700" />
            <span>عذر طبي</span>
          </span>
        );
    }
  };

  const handleSaveNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(tempNote.trim());
    setShowNoteModal(false);
  };

  return (
    <div
      id={`student-card-${student.id}`}
      className={`relative bg-white rounded-xl border transition-all shadow-xs overflow-hidden ${
        currentStatus === 'absent'
          ? 'border-red-300 bg-red-50/20'
          : currentStatus === 'late'
          ? 'border-amber-300 bg-amber-50/15'
          : currentStatus === 'excused'
          ? 'border-blue-300 bg-blue-50/15'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex flex-col gap-3">
        {/* Top Info Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            {/* Student Avatar / Number Badge */}
            {!fastLoadMode ? (
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 border ${
                  currentStatus === 'absent'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : currentStatus === 'late'
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : currentStatus === 'excused'
                    ? 'bg-blue-100 text-blue-800 border-blue-200'
                    : 'bg-slate-100 text-slate-800 border-slate-200'
                }`}
              >
                {student.seatNumber}
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-slate-200 text-slate-900 flex items-center justify-center font-bold text-sm border border-slate-300">
                {student.seatNumber}
              </div>
            )}

            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {student.name}
                </h3>
                {student.consecutiveAbsences >= 2 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>غياب متكرر ({student.consecutiveAbsences} أيام)</span>
                  </span>
                )}
              </div>

              <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 font-medium mt-0.5">
                <span>المقعد: {student.seatNumber}</span>
                <span>•</span>
                <span>الهوية: {student.nationalId}</span>
                {student.healthNote && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      <HeartHandshake className="w-3 h-3" />
                      {student.healthNote}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Current Status Badge, Note, and Management Buttons */}
          <div className="flex items-center gap-1.5 justify-between sm:justify-end flex-wrap">
            {getStatusBadge()}

            {/* Note Button */}
            <button
              id={`btn-note-${student.id}`}
              onClick={() => {
                setTempNote(note || '');
                setShowNoteModal(true);
              }}
              title="إضافة ملاحظة على الطالب"
              className={`h-8 px-2 rounded-lg border flex items-center gap-1 text-xs font-semibold transition cursor-pointer ${
                note
                  ? 'bg-blue-50 text-blue-900 border-blue-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{note ? 'ملاحظة مسجلة' : 'ملاحظة'}</span>
            </button>

            {/* Contact Guardian Button */}
            {onContactGuardian && (
              <button
                type="button"
                id={`btn-contact-${student.id}`}
                onClick={() => onContactGuardian(student)}
                title="التواصل مع ولي الأمر والواتساب"
                className="h-8 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">ولي الأمر</span>
              </button>
            )}

            {/* Edit Student Button */}
            {onEditStudent && (
              <button
                type="button"
                id={`btn-edit-student-${student.id}`}
                onClick={() => onEditStudent(student)}
                title="تعديل بيانات الطالب"
                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-900 border border-slate-200 hover:border-blue-300 flex items-center justify-center transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Delete Student Button */}
            {onDeleteStudent && (
              <button
                type="button"
                id={`btn-delete-student-${student.id}`}
                onClick={() => onDeleteStudent(student)}
                title="حذف الطالب من الفصل"
                className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-700 border border-slate-200 hover:border-red-300 flex items-center justify-center transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Existing Note Banner if any */}
        {note && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-900 flex items-start gap-1.5">
            <span className="font-bold whitespace-nowrap">ملاحظة المعلم:</span>
            <span>{note}</span>
          </div>
        )}

        {/* Action Buttons: high-contrast, clean proportions */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-slate-100"
          role="group"
          aria-label={`تحديد حالة الحضور للطالب ${student.name}`}
        >
          {/* Button 1: حاضر (Green) */}
          <button
            id={`btn-present-${student.id}`}
            type="button"
            disabled={isLocked}
            onClick={() => onStatusChange('present')}
            className={`min-h-[42px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition cursor-pointer active:scale-98 ${
              currentStatus === 'present'
                ? 'bg-emerald-700 text-white ring-2 ring-emerald-300 shadow-xs'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>حاضر</span>
          </button>

          {/* Button 2: غائب (Red) */}
          <button
            id={`btn-absent-${student.id}`}
            type="button"
            disabled={isLocked}
            onClick={() => onStatusChange('absent')}
            className={`min-h-[42px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition cursor-pointer active:scale-98 ${
              currentStatus === 'absent'
                ? 'bg-red-700 text-white ring-2 ring-red-300 shadow-xs'
                : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-300'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>غائب</span>
          </button>

          {/* Button 3: متأخر (Amber) */}
          <button
            id={`btn-late-${student.id}`}
            type="button"
            disabled={isLocked}
            onClick={() => onStatusChange('late')}
            className={`min-h-[42px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition cursor-pointer active:scale-98 ${
              currentStatus === 'late'
                ? 'bg-amber-600 text-white ring-2 ring-amber-300 shadow-xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Clock className="w-4 h-4 stroke-[2.5]" />
            <span>متأخر</span>
          </button>

          {/* Button 4: عذر طبي / تصريح (Blue) */}
          <button
            id={`btn-excused-${student.id}`}
            type="button"
            disabled={isLocked}
            onClick={() => onStatusChange('excused')}
            className={`min-h-[42px] px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-sm font-bold transition cursor-pointer active:scale-98 ${
              currentStatus === 'excused'
                ? 'bg-blue-700 text-white ring-2 ring-blue-300 shadow-xs'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-300'
            } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
            <span>عذر طبي</span>
          </button>
        </div>
      </div>

      {/* Quick Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 text-slate-900">
            <h4 className="text-lg font-bold mb-1">ملاحظة للطالب: {student.name}</h4>
            <p className="text-xs text-slate-500 mb-3">
              يمكنك كتابة سبب الغياب أو التأخر (مثل: مستأذن للإشراف، موعد مستشفى، تأخر طابور الصباح).
            </p>
            <form onSubmit={handleSaveNoteSubmit}>
              <textarea
                value={tempNote}
                onChange={e => setTempNote(e.target.value)}
                placeholder="اكتب الملاحظة هنا..."
                rows={3}
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:border-blue-700 focus:outline-hidden mb-3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 h-10 bg-blue-900 hover:bg-blue-800 text-white font-bold text-sm rounded-lg transition cursor-pointer"
                >
                  حفظ الملاحظة
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-lg transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
