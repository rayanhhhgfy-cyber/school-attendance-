/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, SchoolClass } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import {
  UserPlus,
  Edit2,
  Trash2,
  X,
  Check,
  Phone,
  MessageCircle,
  AlertCircle,
  FileText,
  Users,
  FileSpreadsheet,
  Upload,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export type StudentModalMode = 'add' | 'edit' | 'bulk_add' | 'contact' | 'delete_confirm';

interface StudentManagementModalProps {
  isOpen: boolean;
  mode: StudentModalMode;
  initialClassId?: string;
  studentToEdit?: Student | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  isOpen,
  mode: initialMode,
  initialClassId,
  studentToEdit,
  onClose,
  onSuccess,
}) => {
  const {
    classes,
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    selectedClassId,
  } = useAttendance();

  const [activeMode, setActiveMode] = useState<StudentModalMode>(initialMode);
  const [selectedClass, setSelectedClass] = useState<string>(
    studentToEdit?.classId || initialClassId || selectedClassId || classes[0]?.id || 'class-9th'
  );

  const excelInputRef = useRef<HTMLInputElement>(null);

  // Single Student Form State
  const [name, setName] = useState('');
  const [seatNumber, setSeatNumber] = useState<number>(1);
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [healthNote, setHealthNote] = useState('');
  const [academicNote, setAcademicNote] = useState('');

  // Bulk Add Form State
  const [bulkNames, setBulkNames] = useState('');

  // Validation & feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Sync state when modal opens or student changes
  useEffect(() => {
    setActiveMode(initialMode);
    setErrorMsg('');
    setSuccessMsg('');

    const targetClassId = studentToEdit?.classId || initialClassId || selectedClassId || classes[0]?.id || 'class-9th';
    setSelectedClass(targetClassId);

    if (studentToEdit && (initialMode === 'edit' || initialMode === 'contact' || initialMode === 'delete_confirm')) {
      setName(studentToEdit.name);
      setSeatNumber(studentToEdit.seatNumber);
      setParentName(studentToEdit.parentName || '');
      setParentPhone(studentToEdit.parentPhone || studentToEdit.guardianPhone || '');
      setHealthNote(studentToEdit.healthNote || '');
      setAcademicNote(studentToEdit.academicNote || '');
    } else {
      // Calculate next available seat number for this class
      const classStudents = students.filter(s => s.classId === targetClassId);
      const nextSeat = classStudents.length > 0 ? Math.max(...classStudents.map(s => s.seatNumber)) + 1 : 1;
      
      setName('');
      setSeatNumber(nextSeat);
      setParentName('');
      setParentPhone('05' + Math.floor(10000000 + Math.random() * 90000000));
      setHealthNote('');
      setAcademicNote('');
      setBulkNames('');
    }
  }, [isOpen, initialMode, studentToEdit, initialClassId, selectedClassId, classes, students]);

  if (!isOpen) return null;

  const currentClassObj = classes.find(c => c.id === selectedClass) || classes[0];

  // Robust "5-Year-Old Format" Excel/CSV/Text Parser
  const extractNamesFromContent = (text: string): string[] => {
    const EXCLUDE_HEADER_KEYWORDS = [
      'اسم الطالب', 'أسماء الطلاب', 'الاسم الثلاثي', 'الاسم الرباعي',
      'الوطني', 'رقم الوطني', 'رقم الجلوس', 'رقم المقعد', 'الفصل', 'الصف',
      'ملاحظات', 'حاضر', 'غائب', 'متأخر', 'تاريخ', 'كشف الحضور',
      'اسم', 'الاسم', 'المدرسة', 'جدول', 'م', 'ت', 'السجل المدني',
      'name', 'student name', 'id', 'seat', 'class', 'status', 'notes',
    ];

    // Split by newlines, commas, tabs, semicolons, or pipe symbols
    const rawTokens = text.split(/[\r\n,;\t|]+/);
    const foundNames: string[] = [];

    rawTokens.forEach(token => {
      // Clean leading numbers (e.g., "1. خالد" -> "خالد")
      let clean = token.trim().replace(/^[0-9\-\.\s\)\(]+/, '').trim();
      if (!clean) return;

      // Check header matches
      const lower = clean.toLowerCase();
      const isHeader = EXCLUDE_HEADER_KEYWORDS.some(kw => lower === kw || lower.includes(kw));
      if (isHeader) return;

      // Ignore pure numbers or very short strings
      if (/^\d+$/.test(clean) || clean.length < 3) return;

      // Must have valid Arabic or English characters and at least 2 words (e.g. First Last)
      const words = clean.split(/\s+/).filter(w => w.length > 1);
      if (words.length >= 1 && /^[\u0600-\u06FFa-zA-Z\s]+$/.test(clean)) {
        if (!foundNames.includes(clean)) {
          foundNames.push(clean);
        }
      }
    });

    return foundNames;
  };

  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const names = extractNamesFromContent(content);
        if (names.length > 0) {
          setBulkNames(names.join('\n'));
          setSuccessMsg(`تم استخراج ${names.length} اسم طالب بنجاح من شيت الإكسل!`);
        } else {
          setErrorMsg('تعذر العثور على أسماء طلاب واضحة في الملف. يرجى مراجعة الملف أو لصق الأسماء يدوياً.');
        }
      }
    };
    reader.onerror = () => {
      setErrorMsg('حدث خطأ أثناء قراءة شيت الإكسل.');
    };
    reader.readAsText(file);
  };

  // Handle single student save (add or edit)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الطالب كاملاً.');
      return;
    }

    if (!parentPhone.trim()) {
      setErrorMsg('يرجى إدخال رقم هاتف ولي الأمر.');
      return;
    }

    if (activeMode === 'add') {
      addStudent({
        name: name.trim(),
        seatNumber: Number(seatNumber) || 1,
        classId: selectedClass,
        avatarSeed: name.trim().split(' ')[0] || 'Student',
        parentName: parentName.trim() || `ولي أمر ${name.trim().split(' ')[0]}`,
        parentPhone: parentPhone.trim(),
        guardianPhone: parentPhone.trim(),
        consecutiveAbsences: 0,
        healthNote: healthNote.trim() || undefined,
        academicNote: academicNote.trim() || undefined,
      });
      setSuccessMsg(`تمت إضافة الطالب (${name.trim()}) بنجاح إلى ${currentClassObj?.name}`);
    } else if (activeMode === 'edit' && studentToEdit) {
      updateStudent(studentToEdit.id, {
        name: name.trim(),
        seatNumber: Number(seatNumber) || studentToEdit.seatNumber,
        classId: selectedClass,
        parentName: parentName.trim() || studentToEdit.parentName,
        parentPhone: parentPhone.trim(),
        guardianPhone: parentPhone.trim(),
        healthNote: healthNote.trim() || undefined,
        academicNote: academicNote.trim() || undefined,
      });
      setSuccessMsg(`تم تحديث بيانات الطالب (${name.trim()}) بنجاح`);
    }

    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 600);
  };

  // Handle bulk adding students
  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const lines = bulkNames
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) {
      setErrorMsg('يرجى إدخال أو رفع اسم طالب واحد على الأقل.');
      return;
    }

    const classStudents = students.filter(s => s.classId === selectedClass);
    let currentSeat = classStudents.length > 0 ? Math.max(...classStudents.map(s => s.seatNumber)) + 1 : 1;

    lines.forEach((studentName, idx) => {
      addStudent({
        name: studentName,
        seatNumber: currentSeat++,
        classId: selectedClass,
        avatarSeed: studentName.split(' ')[0] || `Student${idx}`,
        parentName: `ولي أمر ${studentName.split(' ')[0]}`,
        parentPhone: '05' + (30000000 + Math.floor(Math.random() * 60000000)),
        consecutiveAbsences: 0,
      });
    });

    setSuccessMsg(`تمت إضافة ${lines.length} طالب بنجاح إلى ${currentClassObj?.name}!`);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 700);
  };

  // Handle delete student confirmation
  const handleDeleteConfirm = () => {
    if (!studentToEdit) return;
    deleteStudent(studentToEdit.id);
    setSuccessMsg(`تم حذف الطالب (${studentToEdit.name}) نهائياً`);
    setTimeout(() => {
      onSuccess?.();
      onClose();
    }, 500);
  };

  // Quick WhatsApp templates
  const sendWhatsAppMessage = (text: string) => {
    if (!parentPhone) return;
    const cleanPhone = parentPhone.replace(/\D/g, '').replace(/^0/, '966');
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="student-management-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-neutral-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 max-w-2xl w-full overflow-hidden flex flex-col my-auto max-h-[92vh]"
      >
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-slate-900 dark:bg-black text-white flex items-center justify-between border-b border-slate-800 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              {activeMode === 'add' && <UserPlus className="w-5 h-5" />}
              {activeMode === 'edit' && <Edit2 className="w-5 h-5" />}
              {activeMode === 'bulk_add' && <FileSpreadsheet className="w-5 h-5" />}
              {activeMode === 'contact' && <MessageCircle className="w-5 h-5" />}
              {activeMode === 'delete_confirm' && <Trash2 className="w-5 h-5 text-red-300" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                {activeMode === 'add' && 'إضافة طالب جديد'}
                {activeMode === 'edit' && `تعديل بيانات: ${studentToEdit?.name}`}
                {activeMode === 'bulk_add' && 'إضافة أسماء الطلاب من شيت الإكسل'}
                {activeMode === 'contact' && `تواصل مع ولي أمر: ${studentToEdit?.name}`}
                {activeMode === 'delete_confirm' && 'تأكيد حذف الطالب'}
              </h3>
              <p className="text-xs text-slate-300 flex items-center gap-1.5 mt-0.5">
                <span>الفصل:</span>
                <span className="font-bold text-emerald-400">{currentClassObj?.name}</span>
                <span>•</span>
                <span>{currentClassObj?.gradeLevel}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            id="btn-close-student-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs if adding/viewing */}
        {(activeMode === 'add' || activeMode === 'bulk_add') && (
          <div className="px-5 pt-3 pb-1 border-b border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 flex items-center gap-2">
            <button
              type="button"
              id="tab-single-add"
              onClick={() => setActiveMode('add')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'add'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة طالب فردي</span>
            </button>
            <button
              type="button"
              id="tab-bulk-add"
              onClick={() => setActiveMode('bulk_add')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeMode === 'bulk_add'
                  ? 'bg-blue-900 text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 border border-slate-200 dark:border-neutral-700'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>استيراد من كشف إكسل / أسماء</span>
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl text-red-900 dark:text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl text-emerald-900 dark:text-emerald-200 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* MODE 1: SINGLE ADD OR EDIT FORM */}
          {(activeMode === 'add' || activeMode === 'edit') && (
            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم الطالب الرباعي: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="مثال: خالد محمد إبراهيم الشمري"
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Target Class Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الفصل الدراسي: <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.studentCount} طالب)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seat Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم المقعد / الجلوس: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    required
                    value={seatNumber}
                    onChange={e => setSeatNumber(Number(e.target.value))}
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden font-mono"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    رقم جوال ولي الأمر: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    placeholder="0501234567"
                    dir="ltr"
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden text-right"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم ولي الأمر (اختياري):
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="مثال: محمد الشمري"
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Health / Special Notes */}
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      ملاحظة صحية / طبية (إن وجدت):
                    </label>
                    <span className="text-[11px] text-slate-400">تظهر للمعلم في كشف الغياب</span>
                  </div>
                  <input
                    type="text"
                    value={healthNote}
                    onChange={e => setHealthNote(e.target.value)}
                    placeholder="مثال: حساسية من الغبار، سكري، ربو، يرتدي نظارة طبية"
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>

                {/* Academic / Behavior Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ملاحظات أكاديمية وسلوكية:
                  </label>
                  <input
                    type="text"
                    value={academicNote}
                    onChange={e => setAcademicNote(e.target.value)}
                    placeholder="مثال: متفوق في المشاركة، يحتاج تعزيز بالخط، هادئ"
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="btn-submit-save-student"
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{activeMode === 'add' ? 'إضافة الطالب للفصل' : 'حفظ التعديلات'}</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 2: BULK ADD BY EXCEL SHEET OR NAMES */}
          {activeMode === 'bulk_add' && (
            <form onSubmit={handleBulkAdd} className="space-y-4">
              {/* Excel Import Dropzone */}
              <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border-2 border-dashed border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-4 text-center space-y-2.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto shadow-inner">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-200">
                    رفع أسماء الطلاب عبر ملف إكسل (Excel / CSV / TXT)
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300/80 max-w-md mx-auto mt-0.5">
                    القارئ الذكي يستخرج أسماء الطلاب تلقائياً حتى من أبسط وأعقد شيتات الإكسل بكافة التنسيقات.
                  </p>
                </div>

                <input
                  type="file"
                  ref={excelInputRef}
                  onChange={handleExcelFileUpload}
                  accept=".xlsx,.xls,.csv,.txt"
                  className="hidden"
                />

                <button
                  type="button"
                  id="btn-upload-excel-file"
                  onClick={() => excelInputRef.current?.click()}
                  className="h-10 px-5 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>اختر شيت الإكسل من جهازك</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الفصل المستهدف:
                </label>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} (حالياً {cls.studentCount} طالب)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  قائمة الأسماء المستخرجة أو المكتوبة (اسم في كل سطر): <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={bulkNames}
                  onChange={e => setBulkNames(e.target.value)}
                  placeholder={`خالد فهد الشمري\nسلطان ناصر الدوسري\nعبدالعزيز صالح الغامدي\nريان فواز الحربي`}
                  className="w-full p-3.5 bg-slate-50 dark:bg-neutral-950 border border-slate-300 dark:border-neutral-700 rounded-2xl text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:outline-hidden leading-relaxed font-sans"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  عدد الأسماء الحالية:{' '}
                  {bulkNames.split('\n').filter(l => l.trim().length > 0).length} طالب
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  id="btn-submit-bulk-add"
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>إضافة جميع الأسماء للفصل</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: CONTACT GUARDIAN & PROFILE */}
          {activeMode === 'contact' && studentToEdit && (
            <div className="space-y-4">
              {/* Student Summary Card */}
              <div className="bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{studentToEdit.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    <span>المقعد: {studentToEdit.seatNumber}</span>
                    <span>•</span>
                    <span>الفصل: {currentClassObj?.name}</span>
                  </div>
                </div>
                <div className="text-left font-mono">
                  <span className="text-xs text-slate-400 block">جوال ولي الأمر</span>
                  <span className="font-bold text-blue-900 dark:text-blue-400 text-sm" dir="ltr">
                    {parentPhone || studentToEdit.parentPhone}
                  </span>
                </div>
              </div>

              {/* Direct Phone Call Button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${parentPhone || studentToEdit.parentPhone}`}
                  id="btn-call-parent"
                  className="p-3 bg-blue-900 dark:bg-blue-600 hover:bg-blue-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>اتصال هاتفي مباشر</span>
                </a>

                <button
                  type="button"
                  id="btn-edit-from-contact"
                  onClick={() => setActiveMode('edit')}
                  className="p-3 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-slate-200 dark:border-neutral-700 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                  <span>تعديل بيانات الطالب</span>
                </button>
              </div>

              {/* Quick WhatsApp Templates */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  قوالب رسائل واتساب سريعة لولي الأمر:
                </span>

                <button
                  type="button"
                  id="btn-wa-absence"
                  onClick={() =>
                    sendWhatsAppMessage(
                      `السلام عليكم ورحمة الله، نود إحاطتكم بغياب ابنكم (${studentToEdit.name}) عن مدرسة الملك حسين بن طلال الثانوية للبنين اليوم، نرجو الاطمئنان عليه وموافاتنا بالسبب في حال وجود عذر طبي. شاكرين تعاونكم.`
                    )
                  }
                  className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800/60 text-right transition cursor-pointer flex items-start gap-3 text-emerald-950 dark:text-emerald-200"
                >
                  <MessageCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">1. إشعار غياب اليوم</span>
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300 block mt-0.5">
                      "نود إحاطتكم بغياب ابنكم ({studentToEdit.name}) عن المدرسة اليوم..."
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-wa-late"
                  onClick={() =>
                    sendWhatsAppMessage(
                      `السلام عليكم ورحمة الله، نود إشعاركم بتأخر الطالب (${studentToEdit.name}) عن بداية اليوم الدراسي والحصة الأولى، نرجو التكرم بالحرص على الحضور في الموعد المحدد.`
                    )
                  }
                  className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800/60 text-right transition cursor-pointer flex items-start gap-3 text-amber-950 dark:text-amber-200"
                >
                  <MessageCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">2. إشعار تأخر عن الحصة</span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-300 block mt-0.5">
                      "نود إشعاركم بتأخر الطالب ({studentToEdit.name}) عن بداية اليوم الدراسي..."
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  id="btn-wa-praise"
                  onClick={() =>
                    sendWhatsAppMessage(
                      `السلام عليكم ورحمة الله، يسر إدارة المدرسة ومعلم المادة الإشادة بتميز وتفوق الطالب (${studentToEdit.name}) ومواظبته الممتازة، بارك الله في جهوده وجهودكم.`
                    )
                  }
                  className="w-full p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-800/60 text-right transition cursor-pointer flex items-start gap-3 text-blue-950 dark:text-blue-200"
                >
                  <MessageCircle className="w-5 h-5 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm block">3. رسالة شكر وتميز للمواظبة</span>
                    <span className="text-[11px] text-blue-800 dark:text-blue-300 block mt-0.5">
                      "يسر إدارة المدرسة ومعلم المادة الإشادة بتميز ومواظبة الطالب..."
                    </span>
                  </div>
                </button>
              </div>

              {/* Danger Zone: Delete button */}
              <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  type="button"
                  id="btn-open-delete-from-contact"
                  onClick={() => setActiveMode('delete_confirm')}
                  className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف الطالب من الفصل</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: DELETE CONFIRMATION */}
          {activeMode === 'delete_confirm' && studentToEdit && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3 text-red-950 dark:text-red-200">
                <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-extrabold text-sm sm:text-base">
                    هل أنت متأكد من حذف الطالب نهائياً؟
                  </h4>
                  <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed">
                    سيتم حذف الطالب <strong>({studentToEdit.name})</strong>، رقم المقعد{' '}
                    <strong>{studentToEdit.seatNumber}</strong>، من سجلات الفصل الدراسي{' '}
                    <strong>({currentClassObj?.name})</strong> وتحديث إجمالي عدد طلاب الفصل.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  إلغاء وتراجع
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-student"
                  onClick={handleDeleteConfirm}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>نعم، احذف الطالب نهائياً</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
