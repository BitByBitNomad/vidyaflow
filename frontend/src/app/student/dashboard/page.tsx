'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { StudentAssignment } from '../../../lib/types';
import {
  BookOpen,
  PlayCircle,
  Trophy,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  HelpCircle,
  GraduationCap,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<StudentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getMyAssignments();
      setAssignments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load assigned quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  const pendingQuizzes = assignments.filter((a) => a.status === 'PENDING');
  const completedQuizzes = assignments.filter((a) => a.status === 'COMPLETED');

  // Overall student average
  const totalCompletedScore = completedQuizzes.reduce((acc, q) => acc + (q.attempt?.score || 0), 0);
  const totalCompletedQuestions = completedQuizzes.reduce((acc, q) => acc + (q.attempt?.totalQuestions || 0), 0);
  const avgAccuracy = totalCompletedQuestions > 0
    ? Math.round((totalCompletedScore / totalCompletedQuestions) * 100)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-20 pt-8 page-wrap">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Learning Portal
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Enrolled Student
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="text-slate-900 font-semibold">{user?.name}</span>. Track your assignments, test mastery, and class standing.
          </p>
        </div>

        {/* Quick stat indicators */}
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-center shadow-card">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Pending</span>
            <span className="text-lg font-bold text-amber-600 tabular-nums">{pendingQuizzes.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-center shadow-card">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed</span>
            <span className="text-lg font-bold text-emerald-600 tabular-nums">{completedQuizzes.length}</span>
          </div>
          {completedQuizzes.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-center shadow-card">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Mastery</span>
              <span className="text-lg font-bold text-brand tabular-nums">{avgAccuracy}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Featured Student Testing & Focus Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Distraction-Free Testing Environment</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Demonstrate Your Curriculum Knowledge With Confidence
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Take verified assessments with zero payload leakage. Each test is locked atomically to ensure fair, single-attempt turn-ins with instant score feedback and live dense ranking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>{pendingQuizzes.length} Assessments Awaiting Attempt</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Anti-Leak Protected</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md group aspect-[16/10] bg-slate-100">
              <img
                src="/assets/test_paper_on_table.jpg"
                alt="Clean examination test papers on desk ready for student testing"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Examination Desk Ready</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">Standard 4-Option Multiple Choice Assessments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl p-14 text-center text-slate-500 border border-slate-200 shadow-card">
          <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading your school assessments and results...</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center space-y-4 border border-dashed border-slate-300 shadow-card">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No assessments assigned yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your instructors have not assigned any curriculum tests to your account yet. When assigned, they will appear right here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Section 1: Pending Quizzes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>Assigned Assessments (Ready to Attempt)</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                {pendingQuizzes.length} Available
              </span>
            </div>

            {pendingQuizzes.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-xs text-slate-500 border border-slate-200 shadow-card">
                Excellent! You have completed all assignments currently queued for you.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingQuizzes.map((item) => (
                  <div
                    key={item.assignmentId}
                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between space-y-5 group"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1 flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>Pending</span>
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
                        <div>
                          Faculty: <strong className="text-slate-800">{item.teacherName}</strong>
                        </div>
                        <div>
                          Length: <strong className="text-slate-800 tabular-nums">{item.totalQuestions} Questions</strong>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`/student/attempt/${item.quizId}`}
                      className="w-full py-3 px-4 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald flex items-center justify-center space-x-2 transition-all cursor-pointer btn-tactile"
                    >
                      <PlayCircle className="w-4 h-4" />
                      <span>Start Assessment Attempt</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Completed Quizzes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Completed Assessments &amp; Results</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium tabular-nums">
                {completedQuizzes.length} Completed
              </span>
            </div>

            {completedQuizzes.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center text-xs text-slate-500 border border-slate-200 shadow-card">
                You haven&apos;t completed any tests yet. Start one from the pending list above!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {completedQuizzes.map((item) => (
                  <div
                    key={item.assignmentId}
                    className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover hover:border-slate-300 space-y-5 flex flex-col justify-between transition-all"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Instructed by {item.teacherName}
                          </p>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 flex-shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Completed</span>
                        </span>
                      </div>

                      {/* Score metrics */}
                      {item.attempt && (
                        <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                            <span className="text-lg font-bold text-slate-900 tabular-nums">
                              {item.attempt.score} / {item.attempt.totalQuestions}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                            <span
                              className={`text-lg font-bold tabular-nums ${
                                item.attempt.accuracy >= 75
                                  ? 'text-emerald-600'
                                  : item.attempt.accuracy >= 50
                                  ? 'text-amber-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {item.attempt.accuracy}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <a
                        href={`/student/result/${item.quizId}`}
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-brand-light hover:bg-indigo-100 text-brand border border-brand-border flex items-center justify-center space-x-1.5 transition-all cursor-pointer btn-tactile"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Review Answers</span>
                      </a>
                      <a
                        href={`/student/leaderboard/${item.quizId}`}
                        className="py-2 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-amber-700 border border-slate-200 hover:border-slate-300 flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer btn-tactile"
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-600" />
                        <span>Leaderboard</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
