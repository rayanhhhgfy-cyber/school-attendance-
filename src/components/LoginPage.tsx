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
  GraduationCap,
  Sparkles,
  ArrowLeft,
  AlertCircle,
  School,
  CheckCircle2,
  Clock,
  Phone,
  Sun,
  Moon,
  Users,
  Calendar,
  FileSpreadsheet,
  Bell,
  X,
  UserPlus,
  LogIn,
  Check,
  ArrowRight,
  ChevronLeft,
} from 'lucide-react';
import { AssignedClassesSelector } from './AssignedClassesSelector';

export const LoginPage: React.FC = () => {
  const { login, registerUser, users, classes, students, theme, toggleTheme } = useAttendance();

  // Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'teacher' | 'manager'>('teacher');
  const [regSubject, setRegSubject] = useState('رياضيات');
  const [regAssignedClasses, setRegAssignedClasses] = useState<string[]>(() =>
    classes && classes.length > 0 ? classes.map(c => c.id) : ['class-9th', 'class-10th', 'class-11th', 'class-12th']
  );
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleOpenAuth = (tab: 'login' | 'register') => {
    setAuthTab(tab);
    setLoginError('');
    setRegError('');
    setIsAuthModalOpen(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim() || !loginPassword) {
      setLoginError('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      const res = login(loginUsername, loginPassword);
      setIsLoggingIn(false);
      if (!res.success) {
        setLoginError(res.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
      } else {
        setIsAuthModalOpen(false);
      }
    }, 200);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('يرجى كتابة الاسم الكامل.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('يرجى كتابة اسم المستخدم.');
      return;
    }
    if (!regPassword || regPassword.length < 3) {
      setRegError('كلمة المرور يجب أن لا تقل عن 3 خانات.');
      return;
    }

    setIsRegistering(true);
    setTimeout(() => {
      const res = registerUser({
        name: regName.trim(),
        username: regUsername.trim(),
        password: regPassword,
        role: regRole,
        subject: regRole === 'teacher' ? regSubject : undefined,
        assignedClasses: regRole === 'teacher' && regAssignedClasses.length > 0 ? regAssignedClasses : undefined,
        phone: regPhone.trim() || undefined,
      });
      setIsRegistering(false);

      if (!res.success) {
        setRegError(res.message || 'حدث خطأ أثناء التسجيل.');
      } else {
        setIsAuthModalOpen(false);
      }
    }, 250);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setLoginUsername(u);
    setLoginPassword(p);
    setLoginError('');
    login(u, p);
  };

  // Find manager and teachers from dynamic users state
  const managerUser = users.find(u => u.role === 'manager') || users[0];
  const teacherUsers = users.filter(u => u.role === 'teacher');

  const isDark = theme === 'dark';

  return (
    <div
      id="view-landing-page"
      dir="rtl"
      className={`min-h-screen ${
        isDark ? 'bg-[#000000] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      } flex flex-col justify-between relative overflow-x-hidden transition-colors duration-200`}
    >
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
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

          {/* Login Button */}
          <button
            type="button"
            id="btn-nav-login"
            onClick={() => handleOpenAuth('login')}
            className="h-9 sm:h-10 px-3.5 sm:px-4 bg-transparent hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold rounded-xl text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول</span>
          </button>

          {/* Register Button */}
          <button
            type="button"
            id="btn-nav-register"
            onClick={() => handleOpenAuth('register')}
            className="h-9 sm:h-10 px-3.5 sm:px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>إنشاء حساب جديد</span>
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
          منصة تعليمية متكاملة تتيح لإدارة المدرسة والمعلمين رصد الحضور بالحصص، إدارة الجداول المدرسية، والتواصل التلقائي مع أولياء أمور الطلاب الغائبين في ثوانٍ معدودة.
        </p>

        {/* Primary Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            id="hero-btn-login"
            onClick={() => handleOpenAuth('login')}
            className="h-12 sm:h-13 px-6 sm:px-8 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2.5 text-sm sm:text-base group"
          >
            <LogIn className="w-5 h-5 group-hover:translate-x-[-2px] transition-transform" />
            <span>تسجيل الدخول للنظام</span>
          </button>

          <button
            type="button"
            id="hero-btn-register"
            onClick={() => handleOpenAuth('register')}
            className={`h-12 sm:h-13 px-6 sm:px-8 font-bold rounded-2xl border transition cursor-pointer flex items-center gap-2 text-sm sm:text-base ${
              isDark
                ? 'bg-[#0d0d0f] hover:bg-neutral-800 text-white border-neutral-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-xs'
            }`}
          >
            <UserPlus className="w-5 h-5 text-blue-500" />
            <span>إنشاء حساب كمعلم أو إداري</span>
          </button>
        </div>

        {/* Live Key Metrics Bar */}
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

      {/* Quick 1-Click Demo Accounts Strip */}
      <section className={`py-8 border-y ${
        isDark ? 'bg-[#0a0a0c] border-neutral-800' : 'bg-slate-100/70 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                حسابات الدخول التجريبي السريع (انقر للدخول المباشر فوراً):
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              يمكنك تجربة دور المدير أو المعلم بضغطة واحدة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Manager Direct Entry */}
            {managerUser && (
              <button
                type="button"
                id="btn-quick-enter-manager"
                onClick={() => handleQuickLogin(managerUser.username, managerUser.password)}
                className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#0d0d0f] hover:bg-neutral-800 border-neutral-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{managerUser.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      مدير
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 block">
                    {managerUser.username} / {managerUser.password}
                  </span>
                </div>
                <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:translate-x-[-2px] transition-transform" />
              </button>
            )}

            {/* Teachers Direct Entries */}
            {teacherUsers.slice(0, 3).map(teacher => (
              <button
                key={teacher.id}
                type="button"
                id={`btn-quick-enter-${teacher.username}`}
                onClick={() => handleQuickLogin(teacher.username, teacher.password)}
                className={`p-3 rounded-xl border text-right transition cursor-pointer flex items-center justify-between group ${
                  isDark
                    ? 'bg-[#0d0d0f] hover:bg-neutral-800 border-neutral-800'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{teacher.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      معلم
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    مادة {teacher.subject || 'عام'} • <span className="font-mono">{teacher.username}</span>
                  </span>
                </div>
                <ArrowLeft className="w-4 h-4 text-blue-500 group-hover:translate-x-[-2px] transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Showcase Grid */}
      <section className="py-12 sm:py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-400">
            مميزات المنظومة
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            كل ما تحتاجه الإدارة والمعلم في مكان واحد
          </h3>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            تصميم سهل وعالي السرعة مخصص لبيئة المدرسة اليومية لتقليل الأعباء الإدارية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Feature 1 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              الرصد الذكي بالاستثناء
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              جميع الطلاب يعتبرون حاضرين تلقائياً، يضغط المعلم فقط على الطالب الغائب أو المتأخر مع تسجيل سبب العذر، مما يوفر وقت الحصة بالكامل.
            </p>
          </div>

          {/* Feature 2 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              جدول الحصص الأسبوعي والتتبع المباشر
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              خاصية "أين يجب أن أكون الآن؟" توضح للمعلم حصته وقاعته الحالية فوراً، مع إمكانية إضافة وتعديل حصص جدوله الدراسي بنفسه.
            </p>
          </div>

          {/* Feature 3 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center justify-center">
              <Phone className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              إشعار أولياء الأمور والواتساب
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              الوصول السريع لهواتف أولياء الأمور وإرسال رسائل التنبيه الرسمية عبر الواتساب والرسائل القصيرة لحالات الغياب المتكرر والتأخير.
            </p>
          </div>

          {/* Feature 4 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              فصل الصلاحيات والأمان الميداني
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              لوحة متخصصة لمدير المدرسة للإشراف العام وتعديل صلاحيات المعلمين، ولوحة مخصصة لكل معلم تقتصر على حصصه وفصوله المعتمدة.
            </p>
          </div>

          {/* Feature 5 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              نظام الإنذار المبكر للغياب
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              رصد تلقائي للطلاب الذين يتغيبون ليومين أو أكثر على التوالي وتنبيه الإدارة والمرشد الطلابي لاتخاذ الإجراء الوقائي.
            </p>
          </div>

          {/* Feature 6 */}
          <div className={`p-6 rounded-2xl border transition-all ${
            isDark ? 'bg-[#0d0d0f] border-neutral-800 hover:border-neutral-700' : 'bg-white border-slate-200 shadow-xs hover:shadow-md'
          } space-y-3`}>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              تقارير تفصيلية قابلة للطباعة
            </h4>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              تصدير فوري لكشوفات الحضور اليومية والأسبوعية، تقارير الفصول، وإحصاءات دقيقة جاهزة للطباعة والرفع للإدارة التعليمية.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-8 sm:p-12 text-center space-y-4 shadow-xl border border-blue-800 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-2xl sm:text-4xl font-black tracking-tight">
            جاهز لبدء رصد الحضور اليوم؟
          </h3>
          <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto">
            سجل دخولك الآن أو أنشئ حساباً جديداً كمعلم للانضمام لكادر مدرسة الملك حسين بن طلال الثانوية.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              id="cta-btn-login"
              onClick={() => handleOpenAuth('login')}
              className="h-11 px-7 bg-white hover:bg-blue-50 text-blue-950 font-black rounded-xl text-sm transition cursor-pointer shadow-md"
            >
              تسجيل الدخول
            </button>
            <button
              type="button"
              id="cta-btn-register"
              onClick={() => handleOpenAuth('register')}
              className="h-11 px-7 bg-blue-800/80 hover:bg-blue-800 text-white border border-blue-700 font-bold rounded-xl text-sm transition cursor-pointer"
            >
              إنشاء حساب جديد
            </button>
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
          نظام رصد الحضور الذكي والغياب الميداني • مدرسة الملك حسين بن طلال الثانوية للبنين • جميع الصلاحيات محفوظة للإدارة المدرسية 1447هـ
        </p>
      </footer>

      {/* Auth Modal (Login / Register) */}
      <AnimatePresence>
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAuthModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-xs cursor-pointer"
            />

            {/* Modal Card */}
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
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-neutral-900 rounded-2xl mb-5 border border-slate-200 dark:border-neutral-800">
                <button
                  type="button"
                  id="tab-btn-login"
                  onClick={() => {
                    setAuthTab('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'login'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>

                <button
                  type="button"
                  id="tab-btn-register"
                  onClick={() => {
                    setAuthTab('register');
                    setRegError('');
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    authTab === 'register'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>إنشاء حساب جديد</span>
                </button>
              </div>

              {/* LOGIN TAB CONTENT */}
              {authTab === 'login' && (
                <div className="space-y-4">
                  <div className="text-right">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      مرحباً بعودتك
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      أدخل بيانات حسابك للدخول إلى النظام المدرسي
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-right">
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
                          placeholder="مثال: rayyan أو saleh"
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
                          placeholder="••••••"
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
                          <span>تسجيل الدخول</span>
                          <ArrowLeft className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>

                  {/* Fast One-Click Switcher Inside Modal */}
                  <div className="pt-2 border-t border-slate-200 dark:border-neutral-800 text-right space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      دخول سريع بنقرة واحدة:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {managerUser && (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(managerUser.username, managerUser.password)}
                          className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold text-xs hover:bg-purple-500/20 transition text-right cursor-pointer"
                        >
                          {managerUser.name} (مدير)
                        </button>
                      )}
                      {teacherUsers[0] && (
                        <button
                          type="button"
                          onClick={() => handleQuickLogin(teacherUsers[0].username, teacherUsers[0].password)}
                          className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs hover:bg-blue-500/20 transition text-right cursor-pointer"
                        >
                          {teacherUsers[0].name} (معلم)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* REGISTER TAB CONTENT */}
              {authTab === 'register' && (
                <div className="space-y-4">
                  <div className="text-right">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      إنشاء حساب كادر جديد
                    </h3>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      انضم إلى النظام وسجل حصصك وفصولك المعتمدة
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <form onSubmit={handleRegisterSubmit} className="space-y-3 text-right">
                    {/* Role Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        نوع الحساب والصلاحية:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('teacher')}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            regRole === 'teacher'
                              ? 'bg-blue-600 text-white border-blue-500'
                              : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800'
                          }`}
                        >
                          <GraduationCap className="w-3.5 h-3.5" />
                          <span>معلم مادة</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRegRole('manager')}
                          className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            regRole === 'manager'
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-100 dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>إدارة / مشرف</span>
                        </button>
                      </div>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الاسم الكامل (مع اللقب):
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="مثال: أ. أحمد العتيبي"
                        required
                        className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition ${
                          isDark
                            ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                            : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Username */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          اسم المستخدم:
                        </label>
                        <input
                          id="reg-username"
                          type="text"
                          value={regUsername}
                          onChange={e => setRegUsername(e.target.value)}
                          placeholder="ahmed"
                          dir="ltr"
                          required
                          className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                          }`}
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          كلمة المرور:
                        </label>
                        <input
                          id="reg-password"
                          type="password"
                          value={regPassword}
                          onChange={e => setRegPassword(e.target.value)}
                          placeholder="••••••"
                          dir="ltr"
                          required
                          className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition text-left ${
                            isDark
                              ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                              : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Subject & Assigned Classes for Teachers */}
                    {regRole === 'teacher' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            المادة الدراسية المسندة:
                          </label>
                          <select
                            value={regSubject}
                            onChange={e => setRegSubject(e.target.value)}
                            className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition cursor-pointer ${
                              isDark
                                ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                                : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                            }`}
                          >
                            <option value="رياضيات">رياضيات</option>
                            <option value="فيزياء">فيزياء</option>
                            <option value="كيمياء">كيمياء</option>
                            <option value="أحياء">أحياء</option>
                            <option value="لغة عربية">لغة عربية</option>
                            <option value="لغة إنجليزية">لغة إنجليزية</option>
                            <option value="تربية إسلامية">تربية إسلامية</option>
                            <option value="حاسب آلي وتقنية">حاسب آلي وتقنية</option>
                            <option value="تاريخ ودراسات اجتماعية">تاريخ ودراسات اجتماعية</option>
                            <option value="تربية بدنية">تربية بدنية</option>
                          </select>
                        </div>

                        <div className="pt-1">
                          <AssignedClassesSelector
                            assignedClasses={regAssignedClasses}
                            onChange={setRegAssignedClasses}
                            isDark={isDark}
                            teacherName={regName}
                          />
                        </div>
                      </>
                    )}

                    {/* Phone (Optional) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        رقم الهاتف (اختياري للتواصل):
                      </label>
                      <input
                        id="reg-phone"
                        type="tel"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        placeholder="05XXXXXXXX"
                        dir="ltr"
                        className={`w-full h-10 px-3 rounded-xl border text-xs sm:text-sm font-medium focus:outline-hidden transition text-left ${
                          isDark
                            ? 'bg-[#141418] text-white border-neutral-700 focus:border-blue-500'
                            : 'bg-slate-50 text-slate-900 border-slate-300 focus:bg-white focus:border-blue-600'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      id="modal-btn-submit-register"
                      disabled={isRegistering}
                      className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
                    >
                      {isRegistering ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>إنشاء الحساب ودخول المنصة</span>
                          <Check className="w-4 h-4" />
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
