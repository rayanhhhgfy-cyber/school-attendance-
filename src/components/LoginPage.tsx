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
  ArrowLeft,
  AlertCircle,
  School,
  CheckCircle2,
  Clock,
  Phone,
  HelpCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, users } = useAttendance();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('يرجى إدخال اسم المستخدم وكلمة المرور.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    }, 200);
  };

  const handleQuickLogin = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
    login(u, p);
  };

  // Find manager and teachers from dynamic users state
  const managerUser = users.find(u => u.role === 'manager') || users[0];
  const teacherUsers = users.filter(u => u.role === 'teacher');

  return (
    <div
      id="view-login-first-page"
      dir="rtl"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden"
    >
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar Branding */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white leading-tight">
              مدرسة الملك حسين بن طلال الثانوية للبنين
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400">
              بوابة رصد الحضور الذكي والغياب الميداني
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>نظام إلكتروني نشط</span>
          </span>
          <span className="text-xs text-slate-400 font-mono bg-slate-800/70 px-2.5 py-1 rounded-lg border border-slate-700">
            1447هـ
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Right Column (Desktop) / Top (Mobile): Context & Presets */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-6 flex flex-col justify-between space-y-5 order-2 lg:order-1"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>الصفحة الأولى • يرجى تسجيل الدخول للمتابعة</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                رصد الحضور اليومي وإدارة الصلاحيات المدرسية
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                منصة متكاملة تتيح لمدير المدرسة متابعة نسب الحضور والغياب لجميع الفصول، وتمكن المعلمين من رصد حصصهم ومجموعاتهم المسندة ومعرفة الطلاب الغائبين وأرقام أولياء أمورهم.
              </p>
            </div>

            {/* Quick Demo Access Buttons Box */}
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                <span className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span>دخول تجريبي سريع ومباشر:</span>
                </span>
                <span className="text-[11px] text-slate-400">انقر للولوج الفوري</span>
              </div>

              {/* Manager Direct Entry */}
              {managerUser && (
                <button
                  type="button"
                  id="btn-quick-login-manager"
                  onClick={() => handleQuickLogin(managerUser.username, managerUser.password)}
                  className="w-full p-3 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-500/40 text-purple-100 flex items-center justify-between transition cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{managerUser.name}</span>
                        <span className="px-2 py-0.5 text-[10px] bg-purple-500/30 text-purple-200 border border-purple-400/40 rounded-md font-bold">
                          مدير المدرسة
                        </span>
                      </div>
                      <span className="text-[11px] text-purple-300 font-mono mt-0.5 block">
                        المستخدم: {managerUser.username} • كلمة المرور: {managerUser.password}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-purple-300 group-hover:translate-x-[-2px] transition">
                    <span>دخول كمدير</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </div>
                </button>
              )}

              {/* Teachers Direct Entries */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  حسابات المعلمين (انقر على أي حساب للدخول المباشر):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {teacherUsers.map(teacher => (
                    <button
                      key={teacher.id}
                      type="button"
                      id={`btn-quick-login-${teacher.username}`}
                      onClick={() => handleQuickLogin(teacher.username, teacher.password)}
                      className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700 text-right transition cursor-pointer group flex items-center justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>{teacher.name}</span>
                        </div>
                        <span className="text-[10px] text-blue-300 font-mono block mt-0.5">
                          المستخدم: <strong>{teacher.username}</strong> • المرور: <strong>{teacher.password}</strong>
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          مادة: {teacher.subject}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400 opacity-90 group-hover:opacity-100 flex-shrink-0">
                        دخول
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Guarantees / Features */}
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 pt-1">
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                <span className="font-semibold block text-slate-300">صلاحيات آمنة</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <Clock className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                <span className="font-semibold block text-slate-300">متابعة الحصص</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                <Phone className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                <span className="font-semibold block text-slate-300">بيانات أولياء الأمور</span>
              </div>
            </div>
          </motion.div>

          {/* Left Column (Desktop) / Center: Dedicated Login Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-6 order-1 lg:order-2"
          >
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col justify-between h-full">
              <div>
                {/* Header inside Form */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      تسجيل الدخول
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      أدخل بيانات الحساب للدخول إلى لوحة التحكم
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-900">
                    <Lock className="w-6 h-6" />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs sm:text-sm flex items-start gap-2.5"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">تعذر تسجيل الدخول</span>
                      <span className="text-xs text-red-700">{errorMessage}</span>
                    </div>
                  </motion.div>
                )}

                {/* Main Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-right">
                  {/* Username Field */}
                  <div>
                    <label
                      htmlFor="page-login-username"
                      className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5"
                    >
                      اسم المستخدم (Username):
                    </label>
                    <div className="relative">
                      <input
                        id="page-login-username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="مثال: rayyan أو saleh"
                        dir="ltr"
                        autoComplete="username"
                        required
                        className="w-full h-12 pr-11 pl-4 bg-slate-50 text-slate-900 font-semibold rounded-xl border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden text-sm transition text-left"
                      />
                      <User className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor="page-login-password"
                      className="block text-xs sm:text-sm font-bold text-slate-700 mb-1.5"
                    >
                      كلمة المرور (Password):
                    </label>
                    <div className="relative">
                      <input
                        id="page-login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••"
                        dir="ltr"
                        autoComplete="current-password"
                        required
                        className="w-full h-12 pr-11 pl-11 bg-slate-50 text-slate-900 font-semibold rounded-xl border border-slate-300 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden text-sm transition text-left"
                      />
                      <Lock className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer"
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="btn-page-submit-login"
                    disabled={isLoading}
                    className="w-full h-12 mt-2 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 text-sm sm:text-base transition cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>دخول للمنصة</span>
                        <ArrowLeft className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Login Helper Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-700" />
                  <span>تذكير: يمكن للمدير تعديل كلمات المرور وإضافة معلمين.</span>
                </div>
                <span className="font-mono text-[11px] text-slate-400">v2.4 Pro</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/40 text-center py-3 px-4 text-xs text-slate-500">
        <p>نظام رصد الحضور الذكي والغياب الميداني • مدرسة الملك حسين بن طلال الثانوية للبنين • جميع الصلاحيات محفوظة للإدارة</p>
      </footer>
    </div>
  );
};
