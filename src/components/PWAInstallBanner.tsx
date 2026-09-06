/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWA';
import { Download, X, Smartphone, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // If already installed or explicitly dismissed, don't show
  if (isInstalled || dismissed) {
    return null;
  }

  // Only render if installable on Android/desktop or iOS
  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      <div
        id="pwa-install-banner"
        className="bg-blue-900 text-white px-4 py-2 border-b border-blue-700 shadow-xs"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5 text-right">
            <div className="p-1.5 bg-blue-800 rounded-lg flex-shrink-0">
              <Smartphone className="w-4 h-4 text-blue-200" />
            </div>
            <div>
              <div className="font-bold text-xs sm:text-sm flex items-center gap-2">
                <span>تثبيت منصة الحضور على جهازك</span>
                <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-semibold">
                  يعمل بدون إنترنت
                </span>
              </div>
              <p className="text-[11px] text-blue-200">
                يمكنك فتح المنصة بضغطة واحدة من الشاشة الرئيسية وتسجيل الحضور دون الحاجة للمتصفح.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isInstallable && (
              <button
                id="btn-pwa-install"
                onClick={install}
                className="flex-1 sm:flex-initial h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 transition text-xs cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تثبيت التطبيق</span>
              </button>
            )}

            {isIOS && (
              <button
                id="btn-pwa-ios-guide"
                onClick={() => setShowIOSModal(true)}
                className="flex-1 sm:flex-initial h-8 px-3 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-1.5 transition text-xs cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>طريقة التثبيت على آيفون</span>
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              aria-label="إغلاق التنبيه"
              className="p-1.5 text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Installation Guide Modal */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-neutral-800 text-slate-900 dark:text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
                  <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>التثبيت على أجهزة iPhone و iPad</span>
                </div>
                <button
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    1
                  </span>
                  <p>
                    اضغط على زر <strong>المشاركة (Share)</strong> في شريط متصفح Safari بأسفل الشاشة.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    2
                  </span>
                  <p>
                    مرّر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية" (Add to Home Screen)</strong>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center flex-shrink-0 text-xs">
                    3
                  </span>
                  <p>
                    اضغط على <strong>"إضافة" (Add)</strong> بالأعلى لتظهر أيقونة المنصة مباشرة على شاشتك.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer shadow-xs"
              >
                فهمت ذلك، شكراً
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
