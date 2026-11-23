'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { api } from '../../../../lib/api';
import { QuizResult } from '../../../../lib/types';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from 'lucide-react';

export default function QuizResultPage() {
  const params = useParams();
  const quizId = params.id as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      loadResult();
    }
  }, [quizId]);

  const loadResult = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQuizResult(quizId);
      setResult(data);

      // Trigger celebratory confetti if score is >= 70%
      if (data.accuracyPercentage >= 70) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#059669', '#D97706', '#818CF8', '#34D399'],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load quiz results.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center text-slate-500 page-wrap">
        <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Calculating final assessment scores &amp; recording submission...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 page-wrap">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error || 'No submission found for this quiz.'}</span>
        </div>
        <a
          href="/student/dashboard"
          className="inline-block px-5 py-2.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200 pb-24 pt-8 page-wrap">
      {/* Result Hero Banner */}
      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-card text-center space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Assessment Attempt Recorded</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {result.quizTitle}
          </h1>
          <p className="text-xs text-slate-500">
            Submitted on {new Date(result.completedAt).toLocaleString()}
          </p>
        </div>

        {/* Large Score Metric Ring */}
        <div className="flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-slate-50 border-4 border-brand-border flex flex-col items-center justify-center shadow-card">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {result.correctAnswers} / {result.totalQuestions}
            </span>
            <span className="text-xs font-bold text-brand uppercase tracking-wider mt-0.5 tabular-nums">
              {result.accuracyPercentage}% Accuracy
            </span>
          </div>
        </div>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 max-w-xl mx-auto">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <div className="text-[10px] text-slate-500 uppercase font-bold">Total Questions</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">{result.totalQuestions}</div>
          </div>
          <div className="bg-emerald-50/70 rounded-lg p-3 border border-emerald-100">
            <div className="text-[10px] text-emerald-700 uppercase font-bold">Correct</div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5 tabular-nums">{result.correctAnswers}</div>
          </div>
          <div className="bg-rose-50/70 rounded-lg p-3 border border-rose-100">
            <div className="text-[10px] text-rose-700 uppercase font-bold">Incorrect</div>
            <div className="text-lg font-bold text-rose-700 mt-0.5 tabular-nums">{result.incorrectAnswers}</div>
          </div>
          <div className="bg-indigo-50/70 rounded-lg p-3 border border-indigo-100">
            <div className="text-[10px] text-brand uppercase font-bold">Accuracy</div>
            <div className="text-lg font-bold text-brand mt-0.5 tabular-nums">{result.accuracyPercentage}%</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`/student/leaderboard/${quizId}`}
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-bold bg-brand hover:bg-brand-hover text-white shadow-brand flex items-center justify-center space-x-2 transition-all cursor-pointer btn-tactile"
          >
            <Trophy className="w-4 h-4 text-white" />
            <span>View School Leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a
            href="/student/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer btn-tactile"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Return to Dashboard</span>
          </a>
        </div>
      </div>

      {/* Question-By-Question Detailed Review */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand" />
          <span>Question-by-Question Review</span>
        </h2>

        <div className="space-y-4">
          {result.review.map((item, idx) => (
            <div
              key={item.questionId}
              className={`bg-white rounded-xl p-6 border shadow-card transition-all ${
                item.isCorrect
                  ? 'border-emerald-200'
                  : 'border-rose-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 tabular-nums">
                  Question {idx + 1}
                </span>
                {item.isCorrect ? (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Correct</span>
                  </span>
                ) : (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center space-x-1">
                    <XCircle className="w-3 h-3 text-rose-600" />
                    <span>Incorrect</span>
                  </span>
                )}
              </div>

              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mt-2 leading-relaxed">
                {item.questionText}
              </h3>

              {/* Options breakdown */}
              <div className="space-y-2 pt-3">
                {item.allOptions.map((opt) => {
                  const wasSelected = opt.id === item.selectedOptionId;
                  const isTheCorrectOne = opt.isCorrect;

                  let borderClass = 'border-slate-200 bg-slate-50/50 text-slate-600';
                  let badge = null;

                  if (wasSelected && isTheCorrectOne) {
                    borderClass = 'border-emerald-400 bg-emerald-50 text-emerald-950 font-medium';
                    badge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Your Correct Choice
                      </span>
                    );
                  } else if (wasSelected && !isTheCorrectOne) {
                    borderClass = 'border-rose-300 bg-rose-50 text-rose-950 font-medium';
                    badge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                        Your Incorrect Choice
                      </span>
                    );
                  } else if (isTheCorrectOne) {
                    borderClass = 'border-emerald-300 bg-emerald-50/60 text-emerald-900';
                    badge = (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Correct Answer Key
                      </span>
                    );
                  }

                  return (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors ${borderClass}`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="w-5 font-bold text-slate-700">{opt.optionLabel}.</span>
                        <span>{opt.optionText}</span>
                      </div>
                      {badge}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
