'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import {
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Save,
  Sparkles,
  Layers,
  Check,
} from 'lucide-react';

interface QuestionDraft {
  questionText: string;
  options: Array<{
    optionLabel: string;
    optionText: string;
    isCorrect: boolean;
  }>;
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      questionText: '',
      options: [
        { optionLabel: 'A', optionText: '', isCorrect: true },
        { optionLabel: 'B', optionText: '', isCorrect: false },
        { optionLabel: 'C', optionText: '', isCorrect: false },
        { optionLabel: 'D', optionText: '', isCorrect: false },
      ],
    },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add new question template
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        options: [
          { optionLabel: 'A', optionText: '', isCorrect: true },
          { optionLabel: 'B', optionText: '', isCorrect: false },
          { optionLabel: 'C', optionText: '', isCorrect: false },
          { optionLabel: 'D', optionText: '', isCorrect: false },
        ],
      },
    ]);
  };

  // Remove question
  const handleRemoveQuestion = (idx: number) => {
    if (questions.length <= 1) {
      setError('A curriculum quiz must have at least one question.');
      return;
    }
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  // Update question text
  const handleQuestionTextChange = (idx: number, text: string) => {
    const updated = [...questions];
    updated[idx].questionText = text;
    setQuestions(updated);
  };

  // Update option text
  const handleOptionTextChange = (
    qIdx: number,
    optIdx: number,
    text: string,
  ) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx].optionText = text;
    setQuestions(updated);
  };

  // Mark option as the single correct answer
  const handleSetCorrectOption = (qIdx: number, optIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optIdx,
    }));
    setQuestions(updated);
  };

  // Form submission & validation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        setError(`Question ${i + 1} statement cannot be blank.`);
        return;
      }

      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].optionText.trim()) {
          setError(`Option ${q.options[j].optionLabel} in Question ${i + 1} cannot be blank.`);
          return;
        }
      }

      const correctCount = q.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) {
        setError(`Question ${i + 1} must have exactly one correct answer selected.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await api.createQuiz({
        title,
        description,
        questions,
      });
      router.push('/teacher/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create quiz.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-20 pt-8 page-wrap">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <a
          href="/teacher/dashboard"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Classroom Dashboard</span>
        </a>
        <span className="text-xs text-slate-500 font-mono">
          Authoring Mode &bull; {questions.length} Question{questions.length > 1 ? 's' : ''}
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Curriculum Assessment
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Compose multiple-choice questions with 4 answer choices and specify the single correct answer key.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quiz Metadata Card */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span>Assessment Details</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quiz Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Concurrency Control"
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Curriculum Notes &amp; Student Instructions
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, time allowance, or topics covered for the students..."
              className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs resize-none"
            />
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand" />
              <span>Questions Builder ({questions.length})</span>
            </h2>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand bg-brand-light hover:bg-indigo-100 border border-brand-border transition-all cursor-pointer btn-tactile"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div
              key={qIdx}
              className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4 relative"
            >
              {/* Question Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="w-7 h-7 rounded-lg bg-brand-light border border-brand-border flex items-center justify-center font-bold text-xs text-brand tabular-nums">
                    {qIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Question {qIdx + 1} of {questions.length}
                  </span>
                </div>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(qIdx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Remove question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Question Statement <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={q.questionText}
                  onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                  placeholder="Enter the question prompt here..."
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs resize-none"
                />
              </div>

              {/* Options */}
              <div className="space-y-2.5 pt-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Multiple-Choice Options (Click radio button to set correct answer key)
                </label>

                <div className="space-y-2">
                  {q.options.map((opt, optIdx) => (
                    <div
                      key={opt.optionLabel}
                      className={`flex items-center space-x-3 p-2.5 rounded-lg border transition-all ${
                        opt.isCorrect
                          ? 'border-emerald-300 bg-emerald-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Radio button to designate correct answer */}
                      <button
                        type="button"
                        onClick={() => handleSetCorrectOption(qIdx, optIdx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          opt.isCorrect
                            ? 'bg-emerald-600 text-white shadow-emerald'
                            : 'border-2 border-slate-300 hover:border-slate-400 bg-white'
                        }`}
                        title="Mark as correct answer"
                      >
                        {opt.isCorrect && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <span className="w-5 text-xs font-bold text-slate-700 text-center">
                        {opt.optionLabel}
                      </span>

                      <input
                        type="text"
                        required
                        value={opt.optionText}
                        onChange={(e) =>
                          handleOptionTextChange(qIdx, optIdx, e.target.value)
                        }
                        placeholder={`Option ${opt.optionLabel} text...`}
                        className="flex-1 bg-transparent border-0 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                      />

                      {opt.isCorrect && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 mr-1 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Correct Key</span>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Add question bottom shortcut */}
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={handleAddQuestion}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs cursor-pointer btn-tactile"
            >
              <PlusCircle className="w-4 h-4 text-brand" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Action Bottom Bar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Total <strong className="text-slate-900 tabular-nums">{questions.length}</strong> questions prepared &bull; Ready to publish to school catalog
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <a
              href="/teacher/dashboard"
              className="w-1/2 sm:w-auto text-center px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
            >
              Cancel
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-brand hover:bg-brand-hover shadow-brand transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 btn-tactile"
            >
              <Save className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Assessment'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
