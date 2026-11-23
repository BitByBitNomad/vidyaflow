'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { QuizAnalytics } from '../../../../lib/types';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowLeft,
  Trophy,
  AlertCircle,
  Search,
  Award,
} from 'lucide-react';

export default function QuizAnalyticsPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [analytics, setAnalytics] = useState<QuizAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');

  useEffect(() => {
    if (quizId) {
      fetchAnalytics();
    }
  }, [quizId]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQuizAnalytics(quizId);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter students
  const filteredStudents = (analytics?.students || []).filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'COMPLETED') return s.completionStatus === 'COMPLETED';
    if (statusFilter === 'PENDING') return s.completionStatus === 'PENDING';
    return true;
  });

  // Calculate mastery distribution bands
  const completedStudents = (analytics?.students || []).filter((s) => s.completionStatus === 'COMPLETED');
  const exemplaryCount = completedStudents.filter((s) => (s.accuracyPercentage || 0) >= 90).length;
  const proficientCount = completedStudents.filter((s) => (s.accuracyPercentage || 0) >= 70 && (s.accuracyPercentage || 0) < 90).length;
  const developingCount = completedStudents.filter((s) => (s.accuracyPercentage || 0) >= 50 && (s.accuracyPercentage || 0) < 70).length;
  const interventionCount = completedStudents.filter((s) => (s.accuracyPercentage || 0) < 50).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200 pb-20 pt-8 page-wrap">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <a
          href="/teacher/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classroom Dashboard</span>
        </a>
        <a
          href={`/student/leaderboard/${quizId}`}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer btn-tactile"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          <span>View Class Leaderboard</span>
        </a>
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
          <p className="text-sm font-medium">Calculating cohort accuracy, completion rates, and score distributions...</p>
        </div>
      ) : !analytics ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-500 border border-slate-200 shadow-card">
          Quiz analytics not found.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-brand-light text-brand border border-brand-border">
                School Performance Report
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {analytics.totalQuestions} Questions Total
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {analytics.quizTitle}
            </h1>
            {analytics.quizDescription && (
              <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
                {analytics.quizDescription}
              </p>
            )}
          </div>

          {/* Metric Cards (assigned, completed, pending, average accuracy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Number of students assigned */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Assigned</span>
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                {analytics.overview.totalStudentsAssigned}
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">Total assigned roster</p>
            </div>

            {/* Number of students who completed it */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                {analytics.overview.totalStudentsCompleted}
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span className="text-emerald-700 font-semibold tabular-nums">{analytics.overview.completionRatePercentage}%</span> completion rate
              </p>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                {analytics.overview.totalStudentsPending}
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">Awaiting submission</p>
            </div>

            {/* Average quiz accuracy */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-all space-y-3">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Accuracy</span>
                <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-brand">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-[32px] font-bold text-slate-900 tracking-tight leading-none tabular-nums">
                {analytics.overview.averageQuizAccuracy}%
              </div>
              <p className="text-xs text-slate-500 pt-1 border-t border-slate-100">Cohort accuracy aggregate</p>
            </div>
          </div>

          {/* Academic Mastery Distribution Strip */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                <Award className="w-4 h-4 text-brand" />
                <span>Class Mastery Bands Breakdown</span>
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {completedStudents.length} Graded Submissions
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50/60 rounded-lg p-3.5 border border-emerald-100">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                  <span>Exemplary (90-100%)</span>
                  <span className="font-bold text-slate-900 text-lg tabular-nums">{exemplaryCount}</span>
                </div>
                <div className="text-[11px] text-emerald-700 mt-0.5">High mastery tier</div>
              </div>

              <div className="bg-indigo-50/60 rounded-lg p-3.5 border border-indigo-100">
                <div className="flex items-center justify-between text-xs font-semibold text-brand">
                  <span>Proficient (70-89%)</span>
                  <span className="font-bold text-slate-900 text-lg tabular-nums">{proficientCount}</span>
                </div>
                <div className="text-[11px] text-indigo-700 mt-0.5">Meeting standard</div>
              </div>

              <div className="bg-amber-50/60 rounded-lg p-3.5 border border-amber-100">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-800">
                  <span>Developing (50-69%)</span>
                  <span className="font-bold text-slate-900 text-lg tabular-nums">{developingCount}</span>
                </div>
                <div className="text-[11px] text-amber-700 mt-0.5">Review recommended</div>
              </div>

              <div className="bg-rose-50/60 rounded-lg p-3.5 border border-rose-100">
                <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                  <span>Intervention (&lt;50%)</span>
                  <span className="font-bold text-slate-900 text-lg tabular-nums">{interventionCount}</span>
                </div>
                <div className="text-[11px] text-rose-700 mt-0.5">Needs 1-on-1 support</div>
              </div>
            </div>
          </div>

          {/* Student-Wise Scores & Accuracy Table */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-brand" />
                  <span>Student Roster Performance Breakdown</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Individual student score, accuracy percentage, and submission timestamps.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student..."
                    className="bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-brand shadow-xs w-44"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-brand shadow-xs"
                >
                  <option value="ALL">All Status</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-500">
                        No students found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => {
                      const isDone = student.completionStatus === 'COMPLETED';

                      return (
                        <tr key={student.studentId} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-2.5">
                              <span className="w-7 h-7 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center font-bold text-xs text-brand">
                                {student.studentName.charAt(0)}
                              </span>
                              <div>
                                <div className="font-semibold text-slate-900">{student.studentName}</div>
                                <div className="text-[11px] text-slate-500">{student.studentEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Completed</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Pending</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <span className="font-bold text-slate-900 text-sm tabular-nums">
                                {student.score} / {student.totalQuestions}
                              </span>
                            ) : (
                              <span className="text-slate-400">&mdash;</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {isDone ? (
                              <span
                                className={`font-bold tabular-nums ${
                                  (student.accuracyPercentage || 0) >= 75
                                    ? 'text-emerald-600'
                                    : (student.accuracyPercentage || 0) >= 50
                                    ? 'text-amber-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {student.accuracyPercentage}%
                              </span>
                            ) : (
                              <span className="text-slate-400">&mdash;</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                            {student.completedAt
                              ? new Date(student.completedAt).toLocaleString()
                              : 'Not submitted yet'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
