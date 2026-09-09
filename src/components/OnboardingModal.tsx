/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import {
  Sparkles,
  BookOpenCheck,
  CheckCircle2,
  Calendar,
  Users,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  X,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const { currentUser } = useAttendance();
  const [currentStep, setCurrentStep] = useState(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const key = `school_att_onboarding_completed_${currentUser.id}`;
      const completed = localStorage.getItem(key);
      if (!completed && externalIsOpen === undefined) {
        setInternalIsOpen(true);
      }
    }
  }, [currentUser, externalIsOpen]);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const steps = [
    {
      title: 'مرحباً بك في المنظومة الرقمية لرصد الحضور الذكي',
      subtitle: 'دليل التعريف السريع بالمنظومة المدرسية المعتمدة',
      icon: <Sparkles className="w-8 h-8 text-amber-400" />,
      badge: 'الخطوة 1 من 5',
      content: (
        <div className="space-y-3 text-right">
          <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            تم تصميم المنظومة خصيصاً لتسهيل وتسريع عملية رصد حضور وغياب الطلاب ميدانياً داخل القاعات الدراسية بأعلى دقة وبدون الحاجة لمعاملات ورقية.
          </p>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <span>تسجيل دخولك كـ <strong>{currentUser?.name}</strong> ({currentUser?.role === 'manager' ? 'مدير المدرسة' : 'معلم مادة'})</span>
          </div>
        </div>
      ),
    },
    {
      title: 'الرصد الذكي بالاستثناء (Smart Exception)',
      subtitle: 'توفير وقت الحصة الكامل للتعليم والتعليم الفعال',
      icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />,
      badge: 'الخطوة 2 من 5',
      content: (
        <div className="space-y-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            جميع طلاب الفصل يتواجدون بحالة <strong className="text-emerald-600 dark:text-emerald-400">"حاضر" تلقائياً</strong> عند فتح الكشف. ضغطة واحدة فقط على بطاقة الطالب تحوله إلى <strong className="text-red-600 dark:text-red-400">"غائب"</strong> أو <strong className="text-amber-600 dark:text-amber-400">"متأخر"</strong>.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-600 dark:text-slate-400">
            <li>زر "اعتماد وإرسال الكشف" يحفظ السجل فورياً.</li>
            <li>إمكانية إرفاق الأعذار الطبية الموثقة بصور مباشرة.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'تبويب "حضور اليوم" وحالة التأكيد',
      subtitle: 'إشراف عام ولحظي على كافة الفصول والحصص',
      icon: <Calendar className="w-8 h-8 text-purple-500" />,
      badge: 'الخطوة 3 من 5',
      content: (
        <div className="space-y-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            يتيح تبويب <strong>"حضور اليوم"</strong> معاينة حالة الحضور لكافة الفصول الدراسية في المدرسة للحصة الحالية، مع إظهار شارة <strong className="text-emerald-600 dark:text-emerald-400">"مؤكد"</strong> أو <strong className="text-amber-600 dark:text-amber-400">"غير مؤكد"</strong> بشكل حي وتفصيلي.
          </p>
        </div>
      ),
    },
    {
      title: 'المعلم البديل والمناوبة المدرسية',
      subtitle: 'إشعار فوري وتكليف صريح بالحصص',
      icon: <UserCheck className="w-8 h-8 text-blue-500" />,
      badge: 'الخطوة 4 من 5',
      content: (
        <div className="space-y-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            عند تكليف مدير المدرسة لمعلم بديل لتغطية حصة معلم غائب، تصل المعلم البديل <strong>تنبيهات فورية</strong> تحتوي على اسم الفصل، الحصة، والمادة الدراسية مع منحه الصلاحية الفورية لرصد الكشف.
          </p>
        </div>
      ),
    },
    {
      title: 'استيراد القوائم وتصوير الكاميرا',
      subtitle: 'مسح ورقي أوتوماتيكي وإمكانية التأكيد',
      icon: <Users className="w-8 h-8 text-indigo-500" />,
      badge: 'الخطوة 5 من 5',
      content: (
        <div className="space-y-3 text-right text-xs sm:text-sm text-slate-700 dark:text-slate-300">
          <p className="leading-relaxed">
            يمكنك رفع أوراق الكشوفات عبر <strong>كاميرا الجوال</strong> أو من ملفات Excel، مع توفر <strong>شاشة مراجعة وتأكيد أسماء الطلاب</strong> قبل إضافتهم النهائية للفصل.
          </p>
        </div>
      ),
    },
  ];

  const handleClose = () => {
    if (currentUser) {
      localStorage.setItem(`school_att_onboarding_completed_${currentUser.id}`, 'true');
    }
    setInternalIsOpen(false);
    if (externalOnClose) externalOnClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs dir-rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl p-6 overflow-hidden text-slate-900 dark:text-slate-100"
        >
          {/* Close / Skip button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-xl transition cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <span>تخطي</span>
            <X className="w-4 h-4" />
          </button>

          {/* Top Indicator Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950/70 text-blue-900 dark:text-blue-300 rounded-full font-bold text-xs border border-blue-200 dark:border-blue-900/60">
              {step.badge}
            </span>
          </div>

          {/* Icon Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-slate-100 dark:bg-neutral-800 rounded-2xl border border-slate-200 dark:border-neutral-700">
              {step.icon}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {step.subtitle}
              </p>
            </div>
          </div>

          {/* Step Body Content */}
          <div className="my-5 min-h-[120px] p-4 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200 dark:border-neutral-800">
            {step.content}
          </div>

          {/* Footer Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep
                      ? 'w-6 bg-blue-600'
                      : 'w-2 bg-slate-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Action Buttons */}
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-10 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="h-10 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span>{currentStep === steps.length - 1 ? 'بدء الاستخدام الآن' : 'التالي (المتابعة)'}</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
