'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { UserRole } from '../../lib/types';
import {
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function LoginPage() {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full name is required.');
        await register(email, password, name, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (demoRole: UserRole, studentIndex?: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await demoLogin(demoRole, studentIndex);
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 animate-in fade-in duration-200 page-wrap">
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-card space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-brand text-white flex items-center justify-center shadow-brand">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Register Account' : 'VidyaFlow Portal'}
          </h1>
          <p className="text-xs text-slate-500">
            {isRegister
              ? 'Join VidyaFlow to author or take interactive quizzes'
              : 'Sign in to access your instructor dashboard or student testing hub'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              !isRegister
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setError(null);
            }}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
              isRegister
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alan Turing"
                    className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('STUDENT')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                      role === 'STUDENT'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('TEACHER')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center space-x-1.5 cursor-pointer transition-all ${
                      role === 'TEACHER'
                        ? 'bg-brand-light border-brand-border text-brand shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Instructor</span>
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              School Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@vidyaflow.ai"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-brand transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 btn-tactile"
          >
            <span>{isLoading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Persona Section */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Instant Demo Login (No Passwords Required)</span>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDemo('TEACHER')}
              className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-brand-border text-left transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center font-bold text-brand text-xs">
                  T
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-brand">
                    Dr. Alan Turing
                  </div>
                  <div className="text-[10px] text-slate-500">Instructor Account &bull; Full Authoring</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand border border-brand-border">
                Teacher
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDemo('STUDENT', '1')}
              className="w-full p-2.5 rounded-lg bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-border text-left transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-light border border-emerald-border flex items-center justify-center font-bold text-emerald-700 text-xs">
                  A
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    Alex Chen
                  </div>
                  <div className="text-[10px] text-slate-500">Student 1 &bull; Active Enrolled Cohort</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-light text-emerald-700 border border-emerald-border">
                Student
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
