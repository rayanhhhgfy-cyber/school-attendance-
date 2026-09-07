import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  School,
  Sparkles,
  CheckCheck,
  AlertTriangle,
  DoorOpen,
  Users,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { SchoolClass } from '../types';

interface AssignedClassesSelectorProps {
  assignedClasses: string[];
  onChange: (newAssigned: string[]) => void;
  isDark?: boolean;
  label?: string;
  teacherName?: string;
}

const GRADE_PRESETS = [
  { label: 'الصف الثامن (8th)', grade: 'الصف الثامن', defaultName: 'الصف الثامن (أ)', defaultRoom: 'قاعة 103' },
  { label: 'الصف السابع (7th)', grade: 'الصف السابع', defaultName: 'الصف السابع (أ)', defaultRoom: 'قاعة 104' },
  { label: 'الصف السادس (6th)', grade: 'الصف السادس', defaultName: 'الصف السادس (أ)', defaultRoom: 'قاعة 105' },
  { label: 'الصف التاسع (9th)', grade: 'الصف التاسع (9th)', defaultName: 'الصف التاسع (ب)', defaultRoom: 'قاعة 101' },
  { label: 'الصف العاشر (10th)', grade: 'الصف العاشر (10th)', defaultName: 'الصف العاشر (ب)', defaultRoom: 'قاعة 102' },
  { label: 'الصف الحادي عشر (11th)', grade: 'الصف الحادي عشر (11th)', defaultName: 'الصف الحادي عشر (ب)', defaultRoom: 'قاعة 201' },
  { label: 'الصف الثاني عشر (12th)', grade: 'الصف الثاني عشر (12th)', defaultName: 'الصف الثاني عشر (ب)', defaultRoom: 'قاعة 202' },
];

export const AssignedClassesSelector: React.FC<AssignedClassesSelectorProps> = ({
  assignedClasses,
  onChange,
  isDark = false,
  label = 'الفصول المسندة للمعلم:',
  teacherName,
}) => {
  const { classes, addClass, updateClass, deleteClass, currentUser } = useAttendance();
  const isManager = currentUser?.role === 'manager';

  // Dialog / Inline Editor State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // Form State
  const [classNameInput, setClassNameInput] = useState('');
  const [gradeLevelInput, setGradeLevelInput] = useState('الصف الثامن');
  const [roomInput, setRoomInput] = useState('قاعة 103');
  const [autoAssign, setAutoAssign] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Confirm State
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  // Open form to add a new class
  const handleOpenAdd = (preset?: (typeof GRADE_PRESETS)[0]) => {
    if (!isManager) return;
    setEditingClassId(null);
    if (preset) {
      setClassNameInput(preset.defaultName);
      setGradeLevelInput(preset.grade);
      setRoomInput(preset.defaultRoom);
    } else {
      setClassNameInput('الصف الثامن (أ)');
      setGradeLevelInput('الصف الثامن');
      setRoomInput('قاعة ' + Math.floor(100 + Math.random() * 200));
    }
    setAutoAssign(true);
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Open form to edit an existing class
  const handleOpenEdit = (cls: SchoolClass, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isManager) return;
    setEditingClassId(cls.id);
    setClassNameInput(cls.name);
    setGradeLevelInput(cls.gradeLevel || 'الصف الدراسي');
    setRoomInput(cls.room || 'قاعة 101');
    setAutoAssign(assignedClasses.includes(cls.id));
    setErrorMsg('');
    setIsFormOpen(true);
  };

  // Confirm delete class
  const handleOpenDelete = (cls: SchoolClass, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isManager) return;
    setClassToDelete(cls);
  };

  const handleConfirmDelete = () => {
    if (!classToDelete || !isManager) return;
    deleteClass(classToDelete.id);
    onChange(assignedClasses.filter(id => id !== classToDelete.id));
    setClassToDelete(null);
  };

  // Save class (Add or Update)
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    const trimmedName = classNameInput.trim();
    if (!trimmedName) {
      setErrorMsg('يرجى تحديد اسم الفصل والشعبة بدقة');
      return;
    }

    if (editingClassId) {
      // Update existing class
      updateClass(editingClassId, {
        name: trimmedName,
        gradeLevel: gradeLevelInput.trim() || 'الصف الدراسي',
        room: roomInput.trim() || 'قاعة دراسية',
      });

      if (autoAssign && !assignedClasses.includes(editingClassId)) {
        onChange([...assignedClasses, editingClassId]);
      } else if (!autoAssign && assignedClasses.includes(editingClassId)) {
        onChange(assignedClasses.filter(id => id !== editingClassId));
      }
    } else {
      // Add new class
      const newCls = addClass({
        name: trimmedName,
        gradeLevel: gradeLevelInput.trim() || 'الصف الدراسي',
        room: roomInput.trim() || 'قاعة دراسية',
        homeroomTeacher: teacherName || 'غير محدد',
        studentCount: 0,
      });

      if (autoAssign) {
        onChange([...assignedClasses, newCls.id]);
      }
    }

    setIsFormOpen(false);
    setEditingClassId(null);
  };

  // Toggle selection of a class
  const toggleClass = (id: string) => {
    if (assignedClasses.includes(id)) {
      onChange(assignedClasses.filter(item => item !== id));
    } else {
      onChange([...assignedClasses, id]);
    }
  };

  // Select all or unselect all
  const toggleSelectAll = () => {
    if (assignedClasses.length === classes.length) {
      onChange([]);
    } else {
      onChange(classes.map(c => c.id));
    }
  };

  return (
    <div className="space-y-2">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className={`block font-bold text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {label}
          </label>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              assignedClasses.length > 0
                ? isDark
                  ? 'bg-blue-950/70 text-blue-400 border border-blue-800'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                : isDark
                ? 'bg-neutral-800 text-slate-400'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {assignedClasses.length} من {classes.length} مسندة
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {classes.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className={`text-[11px] font-bold px-2 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-neutral-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>{assignedClasses.length === classes.length ? 'إلغاء التحديد' : 'تحديد الكل'}</span>
            </button>
          )}

          {isManager && (
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className={`text-xs font-bold px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 shadow-xs ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                  : 'bg-blue-700 hover:bg-blue-800 text-white'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة فصل جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Presets Bar for Manager */}
      {isManager && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          <span className={`text-[11px] font-bold shrink-0 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>إضافة سريعة:</span>
          </span>
          {GRADE_PRESETS.slice(0, 4).map(preset => (
            <button
              key={preset.grade}
              type="button"
              onClick={() => handleOpenAdd(preset)}
              className={`shrink-0 px-2 py-0.5 rounded-md font-bold transition cursor-pointer border flex items-center gap-1 ${
                isDark
                  ? 'bg-[#18181f] hover:bg-neutral-800 text-slate-300 border-neutral-700'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border-slate-200 shadow-2xs hover:border-blue-300'
              }`}
            >
              <Plus className="w-2.5 h-2.5 text-blue-500" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Classes Grid / Checklist */}
      <div
        className={`p-2 rounded-xl border max-h-48 overflow-y-auto space-y-1.5 ${
          isDark ? 'bg-[#121216] border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {classes.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            لا توجد فصول دراسية مضافة حالياً.
          </div>
        ) : (
          classes.map(c => {
            const isSelected = assignedClasses.includes(c.id);
            return (
              <div
                key={c.id}
                onClick={() => toggleClass(c.id)}
                className={`group px-2.5 py-2 rounded-lg border transition cursor-pointer flex items-center justify-between gap-2 select-none ${
                  isSelected
                    ? isDark
                      ? 'bg-blue-950/40 border-blue-600/80 text-white'
                      : 'bg-blue-50/80 border-blue-300 text-slate-900 shadow-2xs'
                    : isDark
                    ? 'bg-[#16161c] border-neutral-800/80 text-slate-300 hover:border-neutral-700'
                    : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Left side: Checkbox + Name & details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center transition shrink-0 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'border border-neutral-600 bg-neutral-900'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs truncate">{c.name}</span>
                      {c.gradeLevel && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            isDark ? 'bg-neutral-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {c.gradeLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-0.5">
                        <DoorOpen className="w-2.5 h-2.5" />
                        {c.room || 'قاعة غير محددة'}
                      </span>
                      {c.studentCount > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Users className="w-2.5 h-2.5" />
                          {c.studentCount} طالب
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Actions (Edit & Delete) - Only Manager */}
                {isManager && (
                  <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      title="تعديل هذا الفصل"
                      onClick={e => handleOpenEdit(c, e)}
                      className={`p-1 rounded-md transition cursor-pointer ${
                        isDark
                          ? 'hover:bg-neutral-700 text-slate-400 hover:text-white'
                          : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      title="حذف هذا الفصل"
                      onClick={e => handleOpenDelete(c, e)}
                      className="p-1 rounded-md transition cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-700 dark:hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* INLINE / OVERLAY MODAL: ADD OR EDIT CLASS */}
      <AnimatePresence>
        {isFormOpen && isManager && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden text-right ${
                isDark ? 'bg-[#16161c] border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div
                className={`p-4 flex items-center justify-between ${
                  editingClassId
                    ? 'bg-amber-600 text-white'
                    : 'bg-blue-900 text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <School className="w-5 h-5" />
                  <h3 className="font-bold text-sm sm:text-base">
                    {editingClassId ? 'تعديل الفصل الدراسي' : 'إضافة فصل دراسي جديد'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition cursor-pointer text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form Body */}
              <form onSubmit={handleSaveClass} className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
                {errorMsg && (
                  <div className="p-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Grade Selection Presets */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    المرحلة والصف الدراسي (اختر أو اكتب):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                    {GRADE_PRESETS.map(preset => (
                      <button
                        key={preset.grade}
                        type="button"
                        onClick={() => {
                          setGradeLevelInput(preset.grade);
                          if (!editingClassId) {
                            setClassNameInput(preset.defaultName);
                            setRoomInput(preset.defaultRoom);
                          }
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition text-center cursor-pointer ${
                          gradeLevelInput === preset.grade
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : isDark
                            ? 'bg-[#1e1e26] text-slate-300 border-neutral-700 hover:bg-neutral-800'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {preset.grade}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={gradeLevelInput}
                    onChange={e => setGradeLevelInput(e.target.value)}
                    placeholder="مثل: الصف الثامن أو المرحلة الثانوية"
                    className={`w-full h-9 px-3 rounded-lg border font-medium text-xs focus:outline-hidden ${
                      isDark
                        ? 'bg-[#1a1a22] border-neutral-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                    }`}
                  />
                </div>

                {/* Specific Class Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      اسم الفصل والشعبة المحدد (بالتفصيل):
                    </label>
                    <span className="text-[11px] text-slate-400">مثال: الصف الثامن (أ)</span>
                  </div>
                  <input
                    type="text"
                    value={classNameInput}
                    onChange={e => setClassNameInput(e.target.value)}
                    required
                    placeholder="مثال: الصف الثامن (أ) أو الصف الثامن - شعبة 2"
                    className={`w-full h-9 px-3 rounded-lg border font-bold text-xs focus:outline-hidden ${
                      isDark
                        ? 'bg-[#1a1a22] border-neutral-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5 text-[11px]">
                    <span className="text-slate-400">تسميات سريعة:</span>
                    {['(أ)', '(ب)', '(ج)', 'شعبة 1', 'شعبة 2'].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          const base = classNameInput.replace(/\s*(\(.*\)|شعبة.*)$/, '').trim() || gradeLevelInput;
                          setClassNameInput(`${base} ${s}`);
                        }}
                        className={`px-1.5 py-0.5 rounded border text-[10px] font-bold cursor-pointer ${
                          isDark
                            ? 'bg-neutral-800 text-slate-300 border-neutral-700 hover:bg-neutral-700'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Room */}
                <div>
                  <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                    القاعة / رقم الغرفة الدراسية:
                  </label>
                  <input
                    type="text"
                    value={roomInput}
                    onChange={e => setRoomInput(e.target.value)}
                    placeholder="قاعة 103 أو معمل الحاسب"
                    className={`w-full h-9 px-3 rounded-lg border font-medium text-xs focus:outline-hidden ${
                      isDark
                        ? 'bg-[#1a1a22] border-neutral-700 text-white focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-blue-600'
                    }`}
                  />
                </div>

                {/* Auto Assign Checkbox */}
                <label className="flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50">
                  <input
                    type="checkbox"
                    checked={autoAssign}
                    onChange={e => setAutoAssign(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    إسناد هذا الفصل تلقائياً لهذا المعلم في القائمة
                  </span>
                </label>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className={`h-9 px-4 rounded-xl font-bold transition cursor-pointer ${
                      isDark
                        ? 'bg-neutral-800 hover:bg-neutral-700 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className={`h-9 px-5 text-white rounded-xl font-bold transition cursor-pointer shadow-xs ${
                      editingClassId
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-blue-800 hover:bg-blue-900'
                    }`}
                  >
                    {editingClassId ? 'تحديث بيانات الفصل' : 'حفظ وإسناد الفصل'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {classToDelete && isManager && (
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-sm rounded-2xl shadow-2xl border p-4 sm:p-5 text-right ${
                isDark ? 'bg-[#18181f] border-neutral-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center mb-3">
                <Trash2 className="w-5 h-5" />
              </div>

              <h4 className="font-bold text-base mb-1">
                حذف فصل ({classToDelete.name})؟
              </h4>
              <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                سيتم حذف هذا الفصل نهائياً من المدرسة وإلغاء إسناده لكافة المعلمين والأنشطة المرتبطة به.
              </p>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClassToDelete(null)}
                  className={`h-9 px-4 rounded-xl font-bold transition cursor-pointer text-xs ${
                    isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs"
                >
                  نعم، حذف الفصل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
