/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAttendance } from '../context/AttendanceContext';
import {
  BookOpenCheck,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Phone,
  Sun,
  Moon,
  Calendar,
  FileSpreadsheet,
  Bell,
  X,
  UserPlus,
  LogIn,
  KeyRound,
  BookOpen,
} from 'lucide-react';

const REGISTRATION_ACCESS_CODE = 'alhussainschoolstudentsattendance';

export const LoginPage: React.FC = () => {
  const { login, registerUser, classes, students, theme, toggleTheme } = useAttendance();

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [authTab, setAuthTab] = useState<'login' | 'code' | 'register'>('login');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Access Code State
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regSubject, setRegSubject] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'code' = 'login') => {
    setLoginError('');
    setCodeError('');
    setRegError('');
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setIsLoggingIn(true);
    const res = await login(loginUsername.trim(), loginPassword);
    setIsLoggingIn(false);

    if (!res.success) {
      setLoginError(res.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError('');

    if (accessCodeInput.trim() !== REGISTRATION_ACCESS_CODE) {
      setCodeError('رمز تفعيل التسجيل غير صحيح. يرجى الحصول على الرمز المعتمد من إدارة المدرسة.');
      return;
    }

    setAuthTab('register');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regFullName.trim() || !regUsername.trim() || !regPassword) {
      setRegError('يرجى ملء جميع الحقول المطلوبة (الاسم، اسم المستخدم، وكلمة المرور).');
      return;
    }

    if (regPassword.length < 3) {
      setRegError('كلمة المرور يجب أن تتكون من 3 خانات على الأقل.');
      return;
    }

    setIsRegistering(true);
    const res = await registerUser({
      name: regFullName.trim(),
      username: regUsername.trim().toLowerCase(),
      password: regPassword,
      phone: regPhone.trim() || undefined,
      subject: regSubject.trim() || 'المواد العامة',
      role: 'teacher',
      assignedClasses: ['class-9th', 'class-10th', 'class-11th', 'class-12th'],
    });
    setIsRegistering(false);

    if (!res.success) {
      setRegError(res.message || 'فشل إنشاء الحساب. يرجى اختيار اسم مستخدم آخر.');
    } else {
      setIsAuthModalOpen(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="view-landing-page"
      dir="rtl"
      className={`min-h-screen ${
        isDark ? 'bg-[#000000] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      } flex flex-col justify-between relative overflow-x-hidden transition-colors duration-200`}
    >
      {/* Background Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header
        className={`sticky top-0 z-40 w-full border-b ${
          isDark
            ? 'border-neutral-800 bg-[#000000]/90'
            : 'border-slate-200 bg-white/95 shadow-2xs'
        } backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base leading-tight">
              مدرسة الملك حسين بن طلال الثانوية للبنين
            </h1>
            <p className={`text-[11px] sm:text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              المنظومة الرقمية لرصد الحضور الذكي والغياب الميداني
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle Button */}
          <button
            id="btn-landing-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            title={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
            className={`h-9 px-2.5 rounded-xl border flex items-center gap-1.5 transition text-xs font-semibold cursor-pointer ${
              isDark
                ? 'bg-[#0d0d0f] hover:bg-neutral-800 text-slate-200 border-neutral-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">فاتح</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-700" />
                <span className="hidden sm:inline">داكن</span>
              </>
            )}
          </button>

          {/* Create Account Button */}
          <button
            type="button"
            id="btn-nav-register"
            onClick={() => handleOpenAuth('code')}
            className="h-9 sm:h-10 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب</span>
          </button>

          {/* Login Button */}
          <button
            type="button"
            id="btn-nav-login"
            onClick={() => handleOpenAuth('login')}
            className="h-9 sm:h-10 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 sm:px-8 pt-10 sm:pt-16 pb-12 sm:pb-20 max-w-7xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400 mx-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>بوابة الإدارة المدرسية المعتمدة • العام الدراسي 1447هـ</span>
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight max-w-4xl mx-auto">
          المنظومة الرقمية المتطورة{' '}
          <span className="text-blue-600 dark:text-blue-400 block sm:inline">
            لرصد الحضور المدرسي
          </span>{' '}
          وإشعار أولياء الأمور
        </h2>

        <p className={`text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          منصة تعليمية متكاملة تتيح لإدارة المدرسة والمعلمين رصد الحضور بالحصص، إدارة الجداول المدرسية، والتواصل التلقائي مع أولياء أمور الطلاب الغائبين.
        </p>

        {/* Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            id="hero-btn-login"
            onClick={() => handleOpenAuth('login')}
            className="h-12 sm:h-13 px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2.5 text-sm sm:text-base group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            <span>تسجيل الدخول للنظام المدرسي</span>
          </button>

          <button
            type="button"
            id="hero-btn-register"
            onClick={() => handleOpenAuth('code')}
            className="h-12 sm:h-13 px-7 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2.5 text-sm sm:text-base"
          >
            <UserPlus className="w-5 h-5" />
            <span>إنشاء حساب معلم جديد</span>
          </button>
        </div>

        {/* Live Metrics */}
        <div className="pt-8 sm:pt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <div className={`p-4 sm:p-5 rounded-2xl border text-center transition-colors ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-2xl sm:text-4xl font-black text-blue-600 dark:text-blue-400 block tracking-tight">
              {students.length > 0 ? `${students.length}+` : '44+'}
            </span>
            <span className={`text-xs sm:text-sm font-bold mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              طالب مسجل في الفصول
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border text-center transition-colors ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-2xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
              96.4%
            </span>
            <span className={`text-xs sm:text-sm font-bold mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              متوسط نسبة الحضور
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border text-center transition-colors ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-2xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 block tracking-tight">
              {classes.length || 4}
            </span>
            <span className={`text-xs sm:text-sm font-bold mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              فصول المرحلة الثانوية (9-12)
            </span>
          </div>

          <div className={`p-4 sm:p-5 rounded-2xl border text-center transition-colors ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-2xl sm:text-4xl font-black text-amber-500 block tracking-tight">
              100%
            </span>
            <span className={`text-xs sm:text-sm font-bold mt-1 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              رصد رقمي بدون أوراق
            </span>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            مميزات المنظومة
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            كل ما تحتاجه الإدارة والمعلم في مكان واحد
          </h3>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            تصميم سهل وعالي السرعة مخصص لبيئة المدرسة اليومية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">الرصد الذكي بالاستثناء</h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              جميع الطلاب يعتبرون حاضرين تلقائياً، يضغط المعلم فقط على الطالب الغائب أو المتأخر.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">جدول الحصص والأماكن</h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              معرفة الحصة والقاعة الحالية فوراً وإدارة الجدول الأسبوعي بكل يسر.
            </p>
          </div>

          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">إشعار أولياء الأمور</h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              إرسال رسائل التنبيه الفورية عبر الواتساب والرسائل النصية.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 w-full border-t text-center py-6 px-4 text-xs transition-colors ${
          isDark
            ? 'border-neutral-900 bg-[#000000] text-slate-500'
            : 'border-slate-200 bg-white text-slate-600'
        }`}
      >
        <p className="font-semibold">
          نظام رصد الحضور الذكي • مدرسة الملك حسين بن طلال الثانوية للبنين • 1447هـ
        </p>
      </footer>

      {/* Auth Modal */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className={`relative z-10 w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 overflow-hidden ${
                isDark
                  ? 'bg-[#0d0d0f] text-slate-100 border-neutral-800'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-neutral-800/50 transition cursor-pointer"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Tabs Switcher */}
              <div className="flex border-b border-neutral-700/50 mb-5 pb-2 text-sm font-bold gap-4">
                <button
                  type="button"
                  onClick={() => handleOpenAuth('login')}
                  className={`pb-2 border-b-2 transition cursor-pointer ${
                    authTab === 'login'
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  تسجيل الدخول
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenAuth('code')}
                  className={`pb-2 border-b-2 transition cursor-pointer ${
                    authTab === 'code' || authTab === 'register'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  إنشاء حساب جديد
                </button>
              </div>

              {/* 1. LOGIN FORM */}
              {authTab === 'login' && (
                <div className="space-y-4 text-right">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      تسجيل الدخول للمنظومة
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      أدخل اسم المستخدم وكلمة المرور المعتمدة
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم المستخدم (Username):
                      </label>
                      <div className="relative">
                        <input
                          id="modal-login-username"
                          type="text"
                          value={loginUsername}
                          onChange={e => setLoginUsername(e.target.value)}
                          dir="ltr"
                          autoComplete="username"
                          required
                          className={`w-full h-11 pr-10 pl-3 rounded-xl border text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                          }`}
                        />
                        <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        كلمة المرور (Password):
                      </label>
                      <div className="relative">
                        <input
                          id="modal-login-password"
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          dir="ltr"
                          autoComplete="current-password"
                          required
                          className={`w-full h-11 pr-10 pl-10 rounded-xl border text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                          }`}
                        />
                        <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="modal-btn-submit-login"
                      disabled={isLoggingIn}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isLoggingIn ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>تسجيل الدخول للمنظومة</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* 2. ACCESS CODE VERIFICATION STEP */}
              {authTab === 'code' && (
                <div className="space-y-4 text-right">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-emerald-500" />
                      <span>تأكيد رمز تفعيل التسجيل</span>
                    </h3>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      يرجى إدخال كود التفعيل المعتمد من مدرسة الملك حسين بن طلال لفتح نموذج إنشاء الحساب.
                    </p>
                  </div>

                  {codeError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{codeError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCodeSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رمز التفعيل المعتمد (Registration Access Code):
                      </label>
                      <div className="relative">
                        <input
                          id="input-access-code"
                          type="text"
                          value={accessCodeInput}
                          onChange={e => setAccessCodeInput(e.target.value)}
                          placeholder="أدخل الكود المعتمد..."
                          dir="ltr"
                          required
                          className={`w-full h-11 pr-10 pl-3 rounded-xl border text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-emerald-600'
                          }`}
                        />
                        <KeyRound className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="btn-verify-access-code"
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>التحقق ومتابعة التسجيل</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* 3. REGISTRATION FORM STEP */}
              {authTab === 'register' && (
                <div className="space-y-4 text-right">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-emerald-500" />
                      <span>إنشاء حساب معلم جديد</span>
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      أدخل البيانات الكاملة لإنشاء حساب معتمد في المنظومة الرقمية
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الاسم الكامل (Full Name):
                      </label>
                      <div className="relative">
                        <input
                          id="modal-reg-name"
                          type="text"
                          value={regFullName}
                          onChange={e => setRegFullName(e.target.value)}
                          placeholder="أ. محمد أحمد العمري"
                          required
                          className={`w-full h-10 pr-9 pl-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600'
                          }`}
                        />
                        <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم المستخدم (Username):
                      </label>
                      <div className="relative">
                        <input
                          id="modal-reg-username"
                          type="text"
                          value={regUsername}
                          onChange={e => setRegUsername(e.target.value)}
                          placeholder="mohammed123"
                          dir="ltr"
                          required
                          className={`w-full h-10 pr-9 pl-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600'
                          }`}
                        />
                        <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          رقم الجوال:
                        </label>
                        <div className="relative">
                          <input
                            id="modal-reg-phone"
                            type="text"
                            value={regPhone}
                            onChange={e => setRegPhone(e.target.value)}
                            placeholder="0501234567"
                            dir="ltr"
                            className={`w-full h-10 pr-9 pl-2 rounded-xl border text-xs font-medium focus:outline-hidden transition text-left ${
                              isDark
                                ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                                : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600'
                            }`}
                          />
                          <Phone className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          المادة / التخصص:
                        </label>
                        <div className="relative">
                          <input
                            id="modal-reg-subject"
                            type="text"
                            value={regSubject}
                            onChange={e => setRegSubject(e.target.value)}
                            placeholder="اللغة العربية"
                            className={`w-full h-10 pr-9 pl-2 rounded-xl border text-xs font-medium focus:outline-hidden transition ${
                              isDark
                                ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                                : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600'
                            }`}
                          />
                          <BookOpen className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        كلمة المرور (Password):
                      </label>
                      <div className="relative">
                        <input
                          id="modal-reg-password"
                          type={showRegPassword ? 'text' : 'password'}
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="••••••••"
                          dir="ltr"
                          required
                          className={`w-full h-10 pr-9 pl-9 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-emerald-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:border-emerald-600'
                          }`}
                        />
                        <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      id="modal-btn-submit-register"
                      disabled={isRegistering}
                      className="w-full h-11 mt-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>إنشاء الحساب وتسجيل الدخول</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
