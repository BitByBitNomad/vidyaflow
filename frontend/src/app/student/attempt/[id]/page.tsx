'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../../lib/api';
import {
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Send,
  Check,
  Lock,
} from 'lucide-react';

export default function QuizAttemptPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId]);

  const loadQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getQuizForAttempt(quizId);
      setQuizData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to start quiz attempt.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const currentQuestion = quizData?.questions?.[currentQuestionIdx];
  const totalQuestions = quizData?.questions?.length || 0;
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const handleSubmit = async () => {
    if (answeredCount < totalQuestions) {
      const unanswered = totalQuestions - answeredCount;
      const confirmSubmit = window.confirm(
        `You still have ${unanswered} unanswered question(s). Are you sure you want to submit your final attempt? Each student may submit only once.`,
      );
      if (!confirmSubmit) return;
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = quizData.questions.map((q: any) => ({
      questionId: q.id,
      selectedOptionId: selectedAnswers[q.id] || '',
    }));

    // Verify all have an answer
    const missing = answersPayload.find((a: any) => !a.selectedOptionId);
    if (missing) {
      setError('Please answer all questions before submitting your attempt.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.submitQuizAttempt(quizId, answersPayload);
      router.push(`/student/result/${quizId}`);
    } catch (err: any) {
      setError(err.message || 'Submission failed.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center text-slate-500 page-wrap">
        <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-sm font-medium">Preparing secure examination room &amp; locking attempt token...</p>
      </div>
    );
  }

  if (error && !quizData) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4 page-wrap">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200 pb-24 pt-8 page-wrap">
      {/* Quiz Header & Progress Bar */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {quizData.title}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Single attempt enforced &bull; Verified examination room</span>
            </p>
          </div>

          <div className="text-right flex items-center space-x-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-light text-brand border border-brand-border font-mono tabular-nums">
              {answeredCount} of {totalQuestions} Answered
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-brand to-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Question Navigator Pills */}
        <div className="flex items-center space-x-2 pt-1 overflow-x-auto pb-1">
          {quizData.questions.map((q: any, idx: number) => {
            const isAnswered = !!selectedAnswers[q.id];
            const isCurrent = idx === currentQuestionIdx;

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentQuestionIdx(idx)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer tabular-nums ${
                  isCurrent
                    ? 'bg-brand text-white shadow-brand scale-105'
                    : isAnswered
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Question Card */}
      {currentQuestion && (
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-card space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand tabular-nums">
              Question {currentQuestionIdx + 1} of {totalQuestions}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
              {currentQuestion.questionText}
            </h2>
          </div>

          {/* Answer Options */}
          <div className="space-y-3 pt-2">
            {currentQuestion.options.map((option: any) => {
              const isSelected = selectedAnswers[currentQuestion.id] === option.id;

              return (
                <div
                  key={option.id}
                  onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex items-center space-x-4 ${
                    isSelected
                      ? 'border-brand bg-brand-light/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-brand text-white'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <span className="text-[11px] font-bold text-slate-600">
                        {option.optionLabel}
                      </span>
                    )}
                  </div>

                  <span className={`flex-1 text-xs sm:text-sm font-medium ${isSelected ? 'text-slate-900 font-semibold' : 'text-slate-800'}`}>
                    {option.optionText}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Navigation & Submit Row */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentQuestionIdx === 0}
              onClick={() => setCurrentQuestionIdx((prev) => prev - 1)}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center space-x-1.5 shadow-xs btn-tactile"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQuestionIdx < totalQuestions - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIdx((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-brand hover:bg-brand-hover shadow-brand transition-all cursor-pointer flex items-center space-x-1.5 btn-tactile"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald transition-all cursor-pointer flex items-center space-x-2 btn-tactile disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Recording Attempt...' : 'Submit Final Attempt'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
