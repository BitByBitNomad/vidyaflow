'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import {
  GraduationCap,
  BookOpen,
  PlusCircle,
  UserCheck,
  ChevronDown,
  LogOut,
  BarChart2,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const pathname = usePathname();

  const isTeacher = user?.role === 'TEACHER';
  const isStudent = user?.role === 'STUDENT';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.03)] h-16">
      <div className="page-wrap h-16 flex items-center justify-between">
        {/* Left: Brand Logo + Schools Pill */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          <a
            href={user ? (isTeacher ? '/teacher/dashboard' : '/student/dashboard') : '/'}
            className="flex items-center space-x-3 group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-brand group-hover:bg-brand-hover transition-colors">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-brand transition-colors">
                  VidyaFlow
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand border border-brand-border uppercase tracking-wider">
                  by BitByBitNomad
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-0.5">
                AI Assessment &amp; Analytics Platform
              </span>
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 pl-4 sm:pl-6 border-l border-slate-200">
              {isTeacher ? (
                <>
                  <a
                    href="/teacher/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                      pathname === '/teacher/dashboard'
                        ? 'bg-brand-light text-brand border border-brand-border/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Class Dashboard</span>
                  </a>
                  <a
                    href="/teacher/create-quiz"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                      pathname === '/teacher/create-quiz'
                        ? 'bg-brand-light text-brand border border-brand-border/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4 text-brand" />
                    <span>Create Quiz</span>
                  </a>
                  <a
                    href="/teacher/assign"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                      pathname === '/teacher/assign'
                        ? 'bg-brand-light text-brand border border-brand-border/60 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Assign Students</span>
                  </a>
                </>
              ) : (
                <a
                  href="/student/dashboard"
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-2 ${
                    pathname === '/student/dashboard'
                      ? 'bg-emerald-light text-emerald-700 border border-emerald-border shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>My Assessments</span>
                </a>
              )}
            </nav>
          )}
        </div>

        {/* Right Side: Role Switcher & User Profile */}
        <div className="flex items-center space-x-3">
          {/* Role Switcher Pill Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 flex items-center space-x-2 shadow-xs transition-all cursor-pointer"
              title="Quickly switch between Teacher and Student accounts"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="hidden sm:inline">Role Switcher</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isDemoDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-dropdown py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsDemoDropdownOpen(false)}
              >
                <div className="px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2 flex items-center justify-between">
                  <span>Switch Active Persona</span>
                  <span className="text-[10px] font-medium text-slate-400">Demo Mode</span>
                </div>

                <div className="p-1 space-y-1">
                  {/* Teacher Option */}
                  <button
                    onClick={() => switchDemoUser('TEACHER')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer ${
                      isTeacher ? 'bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-brand-light border border-brand-border text-brand flex items-center justify-center font-bold text-xs">
                        T
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-brand">
                          Dr. Alan Turing
                        </div>
                        <div className="text-[11px] text-slate-500">Faculty Instructor</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-brand-light text-brand border border-brand-border">
                      Teacher
                    </span>
                  </button>

                  <div className="h-px bg-slate-100 my-1 mx-2"></div>

                  {/* Student 1 Option */}
                  <button
                    onClick={() => switchDemoUser('STUDENT', '1')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-light border border-emerald-border text-emerald-700 flex items-center justify-center font-bold text-xs">
                        A
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-emerald-700">
                          Alex Chen
                        </div>
                        <div className="text-[11px] text-slate-500">Student &bull; Full History</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-light text-emerald-700 border border-emerald-border">
                      Student
                    </span>
                  </button>

                  {/* Student 2 Option */}
                  <button
                    onClick={() => switchDemoUser('STUDENT', '2')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                        B
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Beatriz Morales</div>
                        <div className="text-[11px] text-slate-500">Student 2</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Student
                    </span>
                  </button>

                  {/* Student 3 Option */}
                  <button
                    onClick={() => switchDemoUser('STUDENT', '3')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs hover:bg-slate-50 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-light border border-amber-border text-amber-700 flex items-center justify-center font-bold text-xs">
                        C
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">Chloe Dupont</div>
                        <div className="text-[11px] text-slate-500">Student 3</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-light text-amber-700 border border-amber-border">
                      Student
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Logout */}
          {user ? (
            <div className="flex items-center space-x-2.5">
              <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[11px]">
                  {user.name.charAt(0)}
                </span>
                <span className="font-semibold text-slate-800 pr-1">{user.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isTeacher
                      ? 'bg-brand-light text-brand border border-brand-border'
                      : 'bg-emerald-light text-emerald-700 border border-emerald-border'
                  }`}
                >
                  {isTeacher ? 'Instructor' : 'Student'}
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
