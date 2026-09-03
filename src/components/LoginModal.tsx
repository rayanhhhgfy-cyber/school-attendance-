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
  ShieldCheck,
  GraduationCap,
  Sparkles,
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
  const { login, users } = useAttendance();
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

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
    const res = login(u, p);
    if (res.success && onClose) {
      onClose();
    }
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
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative my-auto"
      >
        {/* Modal Close Button if allowed */}
        {canClose && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق نافذة تسجيل الدخول"
            className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer z-10"
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
            مدرسة الأمل الابتدائية • بوابة المعلمين والإدارة
          </p>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm font-medium flex items-start gap-2.5"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">تعذر تسجيل الدخول</p>
                <p className="text-xs text-red-700 mt-0.5">{errorMessage}</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-right">
            {/* Username Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
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
                  className="w-full h-11 pr-10 pl-3 bg-slate-50 text-slate-900 font-semibold rounded-xl border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden text-sm transition text-left"
                />
                <User className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5">
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
                  className="w-full h-11 pr-10 pl-10 bg-slate-50 text-slate-900 font-semibold rounded-xl border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden text-sm transition text-left"
                />
                <Lock className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
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

          {/* Preset Quick Logins Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">حسابات تجريبية سريعة للتجربة:</span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-semibold">
                اضغط للتعبئة والدخول
              </span>
            </div>

            <div className="space-y-2">
              {/* Manager Quick Login */}
              <button
                type="button"
                onClick={() => handleQuickLogin('rayyan', '2323')}
                className="w-full p-2.5 rounded-xl border border-purple-200 bg-purple-50/80 hover:bg-purple-100/80 text-purple-950 flex items-center justify-between transition cursor-pointer text-right group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-200 text-purple-800 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm">أ. ريان (مدير المدرسة)</span>
                      <span className="px-1.5 py-0.2 text-[10px] bg-purple-200 text-purple-900 rounded-md font-extrabold">
                        صلاحية كاملة
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-700 font-mono mt-0.5">
                      المستخدم: rayyan • كلمة السر: 2323
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-800 group-hover:underline">دخول</span>
              </button>

              {/* Teachers Quick Login List */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('saleh', '123')}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-right transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>أ. صالح العمري</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">saleh / 123</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('fahad', '123')}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-right transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>أ. فهد القحطاني</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">fahad / 123</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('abdulrahman', '123')}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-right transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>أ. عبدالرحمن</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">abdulrahman / 123</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('ahmed', '123')}
                  className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-right transition cursor-pointer"
                >
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-700" />
                    <span>أ. أحمد الشهري</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">ahmed / 123</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
