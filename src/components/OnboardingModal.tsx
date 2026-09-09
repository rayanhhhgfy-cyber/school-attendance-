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
  ShieldCheck,
  LayoutDashboard,
  CalendarDays,
  SlidersHorizontal,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const { currentUser } = useAttendance();
  const [currentStep, setCurrentStep] = useState(0);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowSide: 'top' | 'bottom' | 'center' } | null>(null);

  const steps = [
    {
      targetId: 'tab-take-attendance',
      title: 'قسم "تسجيل الحضور"',
      description: 'هذا الخيار يتيح للمعلم رصد غياب وحضور طلاب الفصل المعتمد للحصة الحالية بالاستثناء الفوري.',
      icon: <BookOpenCheck className="w-5 h-5 text-blue-500" />,
      badge: 'الخطوة 1 من 6',
    },
    {
      targetId: 'tab-todays-attendance',
      title: 'قسم "حضور اليوم"',
      description: 'هنا يمكنك معاينة جميع الفصول الدراسية والتأكد مما إذا كان الحضور مؤكداً أو غير مؤكد للحصة الحالية.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
      badge: 'الخطوة 2 من 6',
    },
    {
      targetId: 'tab-dashboard',
      title: 'قسم "التقرير والمتابعة"',
      description: 'يعرض إحصاءات الحضور المباشرة ونسب الغياب وإمكانية تصدير التقرير أو طباعته.',
      icon: <LayoutDashboard className="w-5 h-5 text-purple-500" />,
      badge: 'الخطوة 3 من 6',
    },
    {
      targetId: 'tab-timetable',
      title: 'قسم "الجدول والتنبيهات"',
      description: 'يوضح جدول الحصص الأسبوعي الخاص بك معخاصية "أين يجب أن أكون الآن؟" وتنبيهات المعلم البديل.',
      icon: <CalendarDays className="w-5 h-5 text-amber-500" />,
      badge: 'الخطوة 4 من 6',
    },
    {
      targetId: 'tab-settings',
      title: 'قسم "الإعدادات"',
      description: 'يمكنك من هنا تغيير اسم المستخدم وكلمة المرور الخاصة بك، والتحكم بالوضع الفاتح والداكن.',
      icon: <SlidersHorizontal className="w-5 h-5 text-indigo-500" />,
      badge: 'الخطوة 5 من 6',
    },
    {
      targetId: 'btn-desktop-theme-toggle',
      title: 'التحويل بين الوضع الفاتح والداكن',
      description: 'يمكنك بسهولة التبديل بين المظهر الفاتح المريح أو المظهر الداكن في أي وقت.',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      badge: 'الخطوة 6 من 6',
    },
  ];

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

  // Reposition Tooltip on Step or Resize
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = steps[currentStep];
      if (!step) return;

      let el = document.getElementById(step.targetId);
      // Fallback for mobile bottom navigation buttons
      if (!el && step.targetId.startsWith('tab-')) {
        const mobileTargetMap: Record<string, string> = {
          'tab-take-attendance': 'mobile-nav-take_attendance',
          'tab-todays-attendance': 'mobile-nav-todays_attendance',
          'tab-history': 'mobile-nav-history',
          'tab-dashboard': 'mobile-nav-dashboard',
          'tab-timetable': 'mobile-nav-timetable',
        };
        const altId = mobileTargetMap[step.targetId];
        if (altId) el = document.getElementById(altId);
      }

      if (el) {
        const rect = el.getBoundingClientRect();
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
          setTooltipPos({
            top: rect.top > window.innerHeight / 2 ? rect.top - 180 : rect.bottom + 12,
            left: Math.max(16, Math.min(window.innerWidth - 300, rect.left - 80)),
            arrowSide: rect.top > window.innerHeight / 2 ? 'bottom' : 'top',
          });
        } else {
          setTooltipPos({
            top: rect.bottom + 14,
            left: Math.max(20, Math.min(window.innerWidth - 340, rect.left - 40)),
            arrowSide: 'top',
          });
        }
      } else {
        // Center fallback
        setTooltipPos(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, isOpen]);

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
      <div className="fixed inset-0 z-50 pointer-events-none dir-rtl">
        {/* Backdrop for click block and focus spotlight effect */}
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-[1px] pointer-events-auto cursor-pointer"
        />

        {/* Floating Callout Tooltip Card */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          style={
            tooltipPos
              ? {
                  position: 'fixed',
                  top: `${tooltipPos.top}px`,
                  left: `${tooltipPos.left}px`,
                  zIndex: 60,
                }
              : {
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 60,
                }
          }
          className="w-[320px] sm:w-[350px] bg-white dark:bg-neutral-900 border-2 border-blue-500 rounded-2xl shadow-2xl p-4 pointer-events-auto text-slate-900 dark:text-slate-100"
        >
          {/* Visual Pointer Callout Triangle */}
          {tooltipPos && tooltipPos.arrowSide === 'top' && (
            <div className="absolute -top-3 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-b-8 border-b-blue-500" />
          )}
          {tooltipPos && tooltipPos.arrowSide === 'bottom' && (
            <div className="absolute -bottom-3 right-8 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-blue-500" />
          )}

          {/* Callout Header */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-neutral-800 pb-2.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl border border-blue-200 dark:border-blue-900/60">
                {step.icon}
              </span>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                  {step.title}
                </h4>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 block mt-0.5">
                  {step.badge}
                </span>
              </div>
            </div>

            {/* Skip Option */}
            <button
              type="button"
              onClick={handleClose}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <span>تخطي</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Explanatory Body Text */}
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-3">
            {step.description}
          </p>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-neutral-800">
            {/* Step Indicators */}
            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStep ? 'w-4 bg-blue-600' : 'w-1.5 bg-slate-300 dark:bg-neutral-700'
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="h-8 px-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-neutral-800 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>السابق</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="h-8 px-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-md"
              >
                <span>{currentStep === steps.length - 1 ? 'فهمت، ابدأ الأن' : 'المتابعة'}</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
