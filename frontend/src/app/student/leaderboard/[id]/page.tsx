'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '../../../../lib/api';
import { LeaderboardData } from '../../../../lib/types';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  ArrowLeft,
  Users,
  AlertCircle,
  Zap,
} from 'lucide-react';

export default function LeaderboardPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      loadLeaderboard();
    }
  }, [quizId]);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.getQuizLeaderboard(quizId);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz leaderboard.');
    } finally {
      setIsLoading(false);
    }
  };

  const top3 = data?.leaderboard?.slice(0, 3) || [];
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-24 pt-8 page-wrap">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <a
          href="/student/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </a>
        <span className="text-xs text-slate-500 flex items-center space-x-1.5 font-mono">
          <Zap className="w-3.5 h-3.5 text-amber-500" />
          <span>Dense Ranking Engine Active</span>
        </span>
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
          <p className="text-sm font-medium">Calculating class standing from school assessment records...</p>
        </div>
      ) : !data ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-500 border border-slate-200 shadow-card">
          Leaderboard not found.
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>School Assessment Leaderboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {data.quizTitle}
            </h1>
            <p className="text-xs text-slate-500">
              Rankings computed by accuracy percentage (Dense Ranking tie-breaker enabled: no ranks skipped)
            </p>
          </div>

          {/* Current Student's Rank Callout Banner (if student submitted) */}
          {data.myEntry && (
            <div className="bg-white rounded-xl p-5 border border-amber-300 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-300 flex items-center justify-center font-black text-2xl text-amber-800 tabular-nums shadow-xs">
                  #{data.myRank}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center space-x-2">
                    <span>Your Class Standing</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-black">
                      YOU
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900 mt-0.5">
                    {data.myEntry.studentName}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-center sm:text-right">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Score</span>
                  <span className="text-lg font-bold text-slate-900 tabular-nums">
                    {data.myEntry.correctAnswers} / {data.myEntry.totalQuestions}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy</span>
                  <span className="text-lg font-bold text-emerald-600 tabular-nums">
                    {data.myEntry.accuracyPercentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Top 3 Podium View */}
          {top3.length > 0 && (
            <div className="pt-2">
              <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-lg mx-auto">
                {/* 2nd Place */}
                {second ? (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 mb-2 shadow-xs">
                      <Medal className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px] text-center">
                      {second.studentName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono font-medium tabular-nums">
                      {second.accuracyPercentage}%
                    </div>
                    <div className="w-full h-24 rounded-t-lg bg-slate-100 border border-b-0 border-slate-200 mt-2 flex flex-col items-center justify-center shadow-xs">
                      <span className="text-xl font-black text-slate-700 tabular-nums">#2</span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Silver</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}

                {/* 1st Place */}
                {first && (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center font-bold text-sm text-amber-700 mb-2 shadow-card">
                      <Crown className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[110px] text-center">
                      {first.studentName}
                    </div>
                    <div className="text-[11px] text-amber-700 font-mono font-bold tabular-nums">
                      {first.accuracyPercentage}%
                    </div>
                    <div className="w-full h-32 rounded-t-lg bg-amber-50 border border-b-0 border-amber-200 mt-2 flex flex-col items-center justify-center shadow-card">
                      <span className="text-2xl font-black text-amber-800 tabular-nums">#1</span>
                      <span className="text-[10px] uppercase font-bold text-amber-700">Gold</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place */}
                {third ? (
                  <div className="flex-1 flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-xs text-orange-700 mb-2 shadow-xs">
                      <Award className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate max-w-[110px] text-center">
                      {third.studentName}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono font-medium tabular-nums">
                      {third.accuracyPercentage}%
                    </div>
                    <div className="w-full h-18 rounded-t-lg bg-orange-50 border border-b-0 border-orange-200 mt-2 flex flex-col items-center justify-center shadow-xs">
                      <span className="text-xl font-black text-orange-800 tabular-nums">#3</span>
                      <span className="text-[10px] uppercase font-bold text-orange-600">Bronze</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            </div>
          )}

          {/* Full Class Leaderboard Table */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand" />
                <span>Full School Roster Standings</span>
              </h2>
              <span className="text-xs text-slate-500 tabular-nums">
                {data.leaderboard.length} Participants
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Completed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.leaderboard.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No submissions recorded for this quiz yet.
                      </td>
                    </tr>
                  ) : (
                    data.leaderboard.map((entry) => (
                      <tr
                        key={entry.studentId}
                        className={`transition-colors ${
                          entry.isCurrentUser
                            ? 'bg-amber-50/50 font-semibold'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs tabular-nums ${
                              entry.rank === 1
                                ? 'bg-amber-100 text-amber-800 border border-amber-300 font-black'
                                : entry.rank === 2
                                ? 'bg-slate-100 text-slate-700 border border-slate-300 font-bold'
                                : entry.rank === 3
                                ? 'bg-orange-100 text-orange-800 border border-orange-200 font-bold'
                                : 'text-slate-500'
                            }`}
                          >
                            #{entry.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-slate-900">{entry.studentName}</span>
                            {entry.isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black">
                                YOU
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-900 font-medium tabular-nums">
                          {entry.correctAnswers} / {entry.totalQuestions}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 tabular-nums">
                              {entry.accuracyPercentage}%
                            </span>
                            <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                              <div
                                className="bg-gradient-to-r from-brand to-emerald-500 h-full rounded-full"
                                style={{ width: `${entry.accuracyPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                          {entry.completedAt ? new Date(entry.completedAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))
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
