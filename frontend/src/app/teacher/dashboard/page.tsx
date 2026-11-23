'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { Quiz } from '../../../lib/types';
import {
  BookOpen,
  PlusCircle,
  UserCheck,
  BarChart3,
  Users,
  CheckCircle2,
  Trophy,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Search,
  Sparkles,
} from 'lucide-react';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [overview, setOverview] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ACTIVE' | 'NEEDS_ATTENTION'>('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [quizzesData, overviewData] = await Promise.all([
        api.getTeacherQuizzes(),
        api.getTeacherOverview().catch(() => null),
      ]);
      setQuizzes(quizzesData);
      setOverview(overviewData);
    } catch (err: any) {
      setError(err.message || 'Failed to load teacher dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAssigned = overview
    ? overview.totalAssignedCount
    : quizzes.reduce((acc, q) => acc + (q.totalAssigned || 0), 0);
  const totalCompleted = overview
    ? overview.totalCompletedCount
    : quizzes.reduce((acc, q) => acc + (q.totalCompleted || 0), 0);
  const overallAvg = overview ? overview.overallAvgAccuracy : 0;
  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0;

  // Filter quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (quiz.description && quiz.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'ACTIVE') {
      return (quiz.totalAssigned || 0) > 0;
    }
    if (filterMode === 'NEEDS_ATTENTION') {
      return (quiz.averageAccuracy || 0) > 0 && (quiz.averageAccuracy || 0) < 70;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16 pt-8 page-wrap">
      {/* Header with Welcome and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Classroom Analytics &amp; Faculty Console
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-brand-light text-brand border border-brand-border">
              Instructor Mode
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, <span className="text-slate-900 font-semibold">{user?.name}</span>. Monitor assessment completion and class accuracy metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/teacher/create-quiz"
            className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-brand hover:bg-brand-hover shadow-brand flex items-center space-x-2 transition-all cursor-pointer btn-tactile"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Create Quiz</span>
          </a>
          <a
            href="/teacher/assign"
            className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center space-x-2 transition-all cursor-pointer btn-tactile shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Assign Students</span>
          </a>
        </div>
      </div>

      {/* Featured Mentorship & Faculty Session Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-card">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light text-brand text-xs font-semibold border border-brand-border">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <span>Interactive Mentorship &amp; Curriculum Control</span>
            </div>
            
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Drive Student Mastery with Real-Time Learning Insights
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              Conduct high-integrity evaluations, pinpoint topics that challenge your cohort, and provide targeted 1-on-1 feedback before exams.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Cohort: {totalAssigned} Students</span>
              </div>
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{completionRate}% Completion Rate</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-md group aspect-[16/10] bg-slate-100">
              <img
                src="/assets/teacher_student_siting.jpg"
                alt="Teacher and student reviewing assessment progress"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Classroom Review Session</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">Continuous 1-on-1 Mentorship &amp; Guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Uniform School KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Curriculum Tests */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Curriculum Tests
            </span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
            {quizzes.length}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-slate-700 font-semibold tabular-nums">{quizzes.length} published</span>
            <span>&bull;</span>
            <span>Active syllabus</span>
          </div>
        </div>

        {/* Metric 2: Assigned Seats */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Assigned Seats
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
            {totalAssigned}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-blue-700 font-semibold tabular-nums">{totalAssigned} invitations</span>
            <span>&bull;</span>
            <span>Enrolled cohort</span>
          </div>
        </div>

        {/* Metric 3: Submissions & Turn-in Rate */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submissions
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
            {totalCompleted}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold tabular-nums">{completionRate}% Turn-in rate</span>
            <span>&bull;</span>
            <span>Graded attempts</span>
          </div>
        </div>

        {/* Metric 4: Class Mastery */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Class Mastery
            </span>
            <div
              className={`w-9 h-9 rounded-lg border flex items-center justify-center ${
                overallAvg >= 75
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  : 'bg-amber-50 border-amber-100 text-amber-600'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
            {overallAvg > 0 ? `${overallAvg}%` : 'N/A'}
          </div>
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span
              className={`font-semibold ${
                overallAvg >= 75
                  ? 'text-emerald-700'
                  : overallAvg > 0
                  ? 'text-amber-700'
                  : 'text-slate-500'
              }`}
            >
              {overallAvg >= 75 ? 'Exceeding Target' : overallAvg > 0 ? 'On Track' : 'Awaiting data'}
            </span>
            <span>&bull;</span>
            <span>Class aggregate</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title or keyword..."
            className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'ALL'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
            }`}
          >
            All Quizzes ({quizzes.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'ACTIVE'
                ? 'bg-brand text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-xs'
            }`}
          >
            Assigned
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('NEEDS_ATTENTION')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterMode === 'NEEDS_ATTENTION'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 shadow-xs'
            }`}
          >
            Review (&lt;70% Accuracy)
          </button>
        </div>
      </div>

      {/* Quizzes List Section */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-xl p-14 text-center text-slate-500 border border-slate-200 shadow-card">
            <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium">Retrieving class analytics and assessment roster...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center space-y-4 border border-dashed border-slate-300 shadow-card">
            <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">No assessments match your criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'Try adjusting your search terms or clearing the filter.'
                  : 'Get started by creating your first curriculum quiz with multiple-choice questions.'}
              </p>
            </div>
            <a
              href="/teacher/create-quiz"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-brand text-white shadow-brand hover:bg-brand-hover transition-all cursor-pointer btn-tactile"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Create Curriculum Quiz</span>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredQuizzes.map((quiz) => {
              const assigned = quiz.totalAssigned || 0;
              const completed = quiz.totalCompleted || 0;
              const rate = assigned > 0 ? Math.round((completed / assigned) * 100) : 0;
              const avg = quiz.averageAccuracy || 0;

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    {/* Header: Title and Question Count Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand transition-colors">
                          {quiz.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {quiz.description || 'Curriculum assessment test.'}
                        </p>
                      </div>
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0 tabular-nums">
                        {quiz.totalQuestions} Questions
                      </span>
                    </div>

                    {/* Progress Bar & Submissions Indicator */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium flex items-center space-x-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Turn-in Rate:</span>
                          <strong className="text-slate-900 tabular-nums">{completed} / {assigned}</strong>
                        </span>
                        <span className="font-bold text-emerald-600 tabular-nums">{rate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                        <div
                          className="bg-gradient-to-r from-brand to-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Class Average Accuracy Pill */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-slate-500">Cohort Accuracy:</span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border tabular-nums ${
                          avg >= 75
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : avg > 0
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {avg > 0 ? `${avg}% Accuracy` : 'No attempts yet'}
                      </span>
                    </div>
                  </div>

                  {/* Clear Footer Action Row */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100">
                    <a
                      href={`/teacher/analytics/${quiz.id}`}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-brand-light hover:bg-indigo-100 text-brand border border-brand-border flex items-center justify-center space-x-1.5 transition-all cursor-pointer btn-tactile"
                      title="View class performance analytics"
                    >
                      <BarChart3 className="w-3.5 h-3.5 text-brand" />
                      <span>Analytics</span>
                    </a>
                    <a
                      href={`/teacher/assign?quizId=${quiz.id}`}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer btn-tactile"
                      title="Assign to student roster"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Assign</span>
                    </a>
                    <a
                      href={`/student/leaderboard/${quiz.id}`}
                      className="py-2 px-3 rounded-lg text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer btn-tactile"
                      title="View dense-rank leaderboard"
                    >
                      <Trophy className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ranks</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
