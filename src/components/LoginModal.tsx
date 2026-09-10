/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import {
  BookOpenCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  X,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canClose?: boolean;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  canClose = false,
}) => {
  const { login } = useAttendance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('يرجى كتابة اسم المستخدم وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (res.success) {
        if (onClose) onClose();
      } else {
        setErrorMessage(res.message || 'بيانات الدخول غير صحيحة.');
      }
    }, 250);
  };

  return (
    <div
      id="login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir="rtl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 overflow-hidden relative my-auto transition-colors"
      >
        {/* Modal Close Button if allowed */}
        {canClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة تسجيل الدخول"
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded-full transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 text-white text-right relative overflow-hidden">
          <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-3 shadow-inner">
            <BookOpenCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-semibold">
            نظام الدخول الآمن والصلاحيات
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-2">تسجيل الدخول للمنصة</h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 opacity-90">
            مدرسة الملك حسين بن طلال الثانوية للبنين • بوابة المعلمين والإدارة
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-300 text-xs sm:text-sm font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">تعذر تسجيل الدخول</p>
                <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* Username Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                اسم المستخدم (Username):
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="login-username-input"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="مثال: rayyan أو saleh"
                  dir="ltr"
                  autoComplete="username"
                  required
                  className="w-full h-11 pr-10 pl-3 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-hidden text-sm transition text-left"
                />
                <User className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                كلمة المرور (Password):
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  required
                  className="w-full h-11 pr-10 pl-10 bg-slate-50 dark:bg-neutral-950 text-slate-900 dark:text-white font-semibold rounded-xl border border-slate-300 dark:border-neutral-700 focus:bg-white dark:focus:bg-neutral-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:outline-hidden text-sm transition text-left"
                />
                <Lock className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition cursor-pointer"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-submit-login"
              disabled={isLoading}
              className="w-full h-11 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>

          </form>

        </div>
      </motion.div>
    </div>
  );
};
