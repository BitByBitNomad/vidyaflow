'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { Quiz, Student } from '../../../lib/types';
import {
  UserCheck,
  Users,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Check,
} from 'lucide-react';

function AssignQuizContent() {
  const searchParams = useSearchParams();
  const preselectedQuizId = searchParams.get('quizId');

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>(preselectedQuizId || '');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [assignmentStatus, setAssignmentStatus] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedQuizId) {
      fetchQuizAssignmentStatus(selectedQuizId);
    }
  }, [selectedQuizId]);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [quizzesData, studentsData] = await Promise.all([
        api.getTeacherQuizzes(),
        api.getStudents(),
      ]);
      setQuizzes(quizzesData);
      setStudents(studentsData);

      if (!selectedQuizId && quizzesData.length > 0) {
        setSelectedQuizId(quizzesData[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load assignment data.' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuizAssignmentStatus = async (quizId: string) => {
    try {
      const statusData = await api.getQuizAssignmentStatus(quizId);
      setAssignmentStatus(statusData);
    } catch (err: any) {
      // Ignore if new quiz with no assignments
    }
  };

  const assignedStudentIdMap = new Map(
    assignmentStatus.map((a) => [a.studentId, a.status]),
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAllUnassigned = () => {
    const unassigned = students
      .filter((s) => !assignedStudentIdMap.has(s.id))
      .map((s) => s.id);
    setSelectedStudentIds(unassigned);
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedQuizId) {
      setFeedback({ type: 'error', message: 'Please select a quiz to assign.' });
      return;
    }

    if (selectedStudentIds.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least one student from the roster.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.assignQuiz(selectedQuizId, selectedStudentIds);
      setFeedback({
        type: 'success',
        message: result.message || `Successfully assigned quiz to ${selectedStudentIds.length} student(s)!`,
      });
      setSelectedStudentIds([]);
      fetchQuizAssignmentStatus(selectedQuizId);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to assign quiz.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedQuiz = quizzes.find((q) => q.id === selectedQuizId);

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
          Roster Assignment Workflow
        </span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Assign Assessment to Cohort
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Select an assessment, browse enrolled school students, and assign test attempts with single-click batching.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center space-x-2.5 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl p-14 text-center text-slate-500 border border-slate-200 shadow-card">
          <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading curriculum quizzes and school student roster...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center space-y-4 border border-dashed border-slate-300 shadow-card">
          <BookOpen className="w-12 h-12 mx-auto text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No assessments available</h3>
          <p className="text-xs text-slate-500">
            You must create a curriculum quiz before assigning it to students.
          </p>
          <a
            href="/teacher/create-quiz"
            className="inline-block px-4 py-2.5 rounded-lg text-xs font-semibold bg-brand text-white shadow-brand hover:bg-brand-hover transition-all"
          >
            Create Assessment
          </a>
        </div>
      ) : (
        <form onSubmit={handleAssign} className="space-y-6">
          {/* Step 1: Select Quiz */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Step 1: Select Curriculum Assessment</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Quiz
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
              >
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id} className="bg-white text-slate-900">
                    {q.title} ({q.totalQuestions} Questions)
                  </option>
                ))}
              </select>
            </div>

            {selectedQuiz && (
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
                <div>
                  <span className="font-semibold text-slate-900">{selectedQuiz.title}</span>
                  {selectedQuiz.description && (
                    <p className="text-slate-500 mt-0.5 line-clamp-1">{selectedQuiz.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-slate-500 flex-shrink-0">
                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 font-mono tabular-nums">
                    {selectedQuiz.totalQuestions} Questions
                  </span>
                  <span>&bull;</span>
                  <span className="text-emerald-700 font-semibold tabular-nums">
                    {assignmentStatus.length} Already Assigned
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Students */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Select Students from Roster</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose individual students or use quick shortcuts to batch assign.
                </p>
              </div>

              {/* Selection Count Pill */}
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-brand-light text-brand border border-brand-border self-start sm:self-auto tabular-nums">
                {selectedStudentIds.length} Selected
              </span>
            </div>

            {/* Toolbar: Search & Shortcuts */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by name or email..."
                  className="w-full bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light shadow-xs"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllUnassigned}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer btn-tactile"
                >
                  Select All Unassigned
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer btn-tactile"
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Students List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-96 overflow-y-auto pr-1">
              {filteredStudents.length === 0 ? (
                <div className="col-span-2 py-8 text-center text-xs text-slate-500">
                  No students found matching your search.
                </div>
              ) : (
                filteredStudents.map((student) => {
                  const currentStatus = assignedStudentIdMap.get(student.id);
                  const isAssigned = !!currentStatus;
                  const isSelected = selectedStudentIds.includes(student.id);

                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected
                          ? 'border-brand bg-brand-light/40 shadow-xs'
                          : isAssigned
                          ? 'border-slate-200 bg-slate-50/70 opacity-80'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-brand text-white'
                              : 'border border-slate-300 group-hover:border-slate-400 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div>
                          <div className="font-semibold text-xs text-slate-900 group-hover:text-brand transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[11px] text-slate-500">{student.email}</div>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {currentStatus === 'COMPLETED' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Submitted</span>
                        </span>
                      ) : currentStatus === 'PENDING' ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Not Assigned
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              {selectedStudentIds.length === 0
                ? 'Select students above to assign this test'
                : `Ready to assign quiz to ${selectedStudentIds.length} student(s)`}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || selectedStudentIds.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-brand hover:bg-brand-hover shadow-brand transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed btn-tactile"
            >
              <UserCheck className="w-4 h-4 text-white" />
              <span>{isSubmitting ? 'Assigning...' : `Assign to ${selectedStudentIds.length} Students`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AssignQuizPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading assignment workflow...</p>
        </div>
      }
    >
      <AssignQuizContent />
    </Suspense>
  );
}
