'use client';

import React, { useState } from 'react';
import { useAuth } from '../lib/auth-context';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  BarChart3,
  Trophy,
  ArrowRight,
  Database,
  Lock,
  Users,
  CheckCircle2,
  Clock,
  Award,
  Check,
  RotateCcw,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function HomePage() {
  const { switchDemoUser } = useAuth();

  // Interactive live quiz sandbox state on the hero screen
  const [selectedHeroOption, setSelectedHeroOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const heroQuestion = {
    statement: "What guarantees that a student cannot submit two simultaneous quiz attempts?",
    options: [
      { id: 'opt-a', label: 'A', text: 'Client-side button disabling', isCorrect: false },
      { id: 'opt-b', label: 'B', text: 'PostgreSQL FOR UPDATE row-level locking', isCorrect: true },
      { id: 'opt-c', label: 'C', text: 'In-memory JavaScript array checks', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'Client browser cookie expiration', isCorrect: false },
    ],
  };

  const handleHeroSelect = (id: string) => {
    if (isSubmitted) return;
    setSelectedHeroOption(id);
  };

  const handleHeroSubmit = () => {
    if (!selectedHeroOption) return;
    setIsSubmitted(true);
  };

  const handleHeroReset = () => {
    setSelectedHeroOption(null);
    setIsSubmitted(false);
  };

  return (
    <div className="w-full bg-slate-50">
      {/* SCREEN 1: HERO */}
      <section className="py-16 lg:py-24 border-b border-slate-200 bg-white">
        <div className="page-wrap grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Core Positioning & Actions */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-brand-light border border-brand-border text-xs font-semibold text-brand">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              <span>VidyaFlow Platform &bull; Engineered by BitByBitNomad</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              School quizzes with real-time accuracy and verified turn-ins.
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              VidyaFlow delivers high-integrity curriculum testing and intelligent mastery analytics. Instructors author four-option assessments and review cohort mastery bands. Students test in a distraction-free environment with zero answer leaks and dense-rank leaderboards.
            </p>

            {/* Launch Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => switchDemoUser('TEACHER')}
                className="px-6 py-3.5 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-brand transition-all flex items-center justify-center space-x-2 btn-tactile cursor-pointer"
              >
                <span>Launch Faculty Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => switchDemoUser('STUDENT', '1')}
                className="px-6 py-3.5 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 btn-tactile shadow-xs cursor-pointer"
              >
                <span>Take Test as Student</span>
                <GraduationCap className="w-4 h-4 text-emerald-600" />
              </button>
            </div>

            {/* Verifiable Operational Facts */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-slate-900 text-sm block tabular-nums">0 leaks</span>
                <span className="text-slate-500 text-[11px]">Stripped payloads</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-emerald-600 text-sm block">Guaranteed</span>
                <span className="text-slate-500 text-[11px]">Single submission</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span className="font-mono font-bold text-amber-600 text-sm block tabular-nums">&lt; 2ms sync</span>
                <span className="text-slate-500 text-[11px]">Live class standing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Examination Visual + Live Interactive Test Sandbox */}
          <div className="lg:col-span-6 space-y-4">
            {/* Real Examination Session Photograph */}
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] shadow-sm group">
              <img
                src="/assets/test_paper_on_table.jpg"
                alt="Clean examination test papers on desk ready for student testing"
                className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/10 to-transparent flex items-end p-4">
                <div className="text-white space-y-0.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Curriculum Examination Session</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">Standardized 4-Option Multiple Choice Assessments</p>
                </div>
              </div>
            </div>

            {/* Live Interactive Test Sandbox Component */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-card">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-100">
                <span className="font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Interactive Test Sandbox</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px]">
                  Sample Concurrency Item
                </span>
              </div>

              <div className="text-xs font-semibold text-slate-800 leading-relaxed">
                {heroQuestion.statement}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {heroQuestion.options.map((opt) => {
                  const isSelected = selectedHeroOption === opt.id;
                  const showResult = isSubmitted;
                  let borderClass = 'border-slate-200 hover:border-slate-300';
                  let bgClass = 'bg-white';

                  if (showResult) {
                    if (opt.isCorrect) {
                      borderClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-900 font-semibold';
                    } else if (isSelected && !opt.isCorrect) {
                      borderClass = 'border-rose-400 bg-rose-50/70 text-rose-900';
                    }
                  } else if (isSelected) {
                    borderClass = 'border-brand bg-brand-light/40 text-brand font-semibold';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleHeroSelect(opt.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center space-x-2.5 cursor-pointer ${borderClass} ${bgClass}`}
                    >
                      <span className="w-5 h-5 rounded border border-slate-200 bg-slate-50 flex items-center justify-center font-bold text-[10px] text-slate-700 flex-shrink-0">
                        {opt.label}
                      </span>
                      <span className="text-[11px] leading-tight">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sandbox Submit / Feedback Bar */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-500">
                  {isSubmitted ? (
                    selectedHeroOption === 'opt-b' ? (
                      <span className="font-bold text-emerald-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct answer! Single submission guarantee enforced.</span>
                      </span>
                    ) : (
                      <span className="font-bold text-rose-600">
                        Incorrect choice. Row locks guarantee concurrency safety.
                      </span>
                    )
                  ) : (
                    <span>Select an answer to test automatic grading.</span>
                  )}
                </div>

                {isSubmitted ? (
                  <button
                    type="button"
                    onClick={handleHeroReset}
                    className="px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!selectedHeroOption}
                    onClick={handleHeroSubmit}
                    className="px-3.5 py-1.5 rounded-lg text-[11px] font-bold bg-brand text-white hover:bg-brand-hover shadow-brand transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    Verify Answer
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 2: TEACHER ASSESSMENT INTELLIGENCE */}
      <section className="py-20 border-b border-slate-200 bg-slate-50">
        <div className="page-wrap space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
              Faculty Intelligence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Class accuracy distributions calculated the second tests close.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Teachers author assessments in four-option format with single correct keys. As students submit, class metrics automatically cluster students into four actionable mastery tiers.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Mastery Bands Display */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Distributed Systems &amp; Concurrency</h3>
                    <p className="text-xs text-slate-500">Cohorts graded: 24 of 26 enrolled students (92% turn-in)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 tabular-nums">
                    78% Class Average
                  </span>
                </div>

                {/* 4 Mastery Tiers */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block">Exemplary</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">9</span>
                    <span className="text-[10px] text-slate-500 block">90 to 100%</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-indigo-50/50 border border-indigo-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-brand block">Proficient</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">11</span>
                    <span className="text-[10px] text-slate-500 block">70 to 89%</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-amber-700 block">Developing</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">3</span>
                    <span className="text-[10px] text-slate-500 block">50 to 69%</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-rose-50/50 border border-rose-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-rose-700 block">Intervention</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">1</span>
                    <span className="text-[10px] text-slate-500 block">Under 50%</span>
                  </div>
                </div>

                {/* Mini student roster sample */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Recent Submissions
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">A</span>
                        <span className="font-semibold text-slate-900">Alex Chen</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-500">5 of 5 correct</span>
                        <span className="font-bold text-emerald-600 tabular-nums">100%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold flex items-center justify-center">B</span>
                        <span className="font-semibold text-slate-900">Beatriz Morales</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-500">4 of 5 correct</span>
                        <span className="font-bold text-slate-900 tabular-nums">80%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center space-x-2.5">
                        <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center justify-center">C</span>
                        <span className="font-semibold text-slate-900">Chloe Dupont</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-slate-500">3 of 5 correct</span>
                        <span className="font-bold text-amber-600 tabular-nums">60%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Topic Mastery & Faculty Mentorship Visual */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9] shadow-sm group">
                <img
                  src="/assets/teacher_student_siting.jpg"
                  alt="Teacher and student reviewing assessment progress"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/10 to-transparent flex items-end p-4">
                  <div className="text-white space-y-0.5">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Faculty Mentorship Review</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium">Pinpointing Question-Level Learning Gaps</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-card">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-brand" />
                    <span>Topic Mastery Breakdown</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-light text-brand">
                    Real-Time
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">ACID Transactions &amp; Row Locking</span>
                      <span className="text-emerald-700 font-mono font-bold">100%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Redis Write-Through Caching</span>
                      <span className="text-brand font-mono font-bold">88%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand h-full rounded-full" style={{ width: '88%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Dense Ranking Tie-Breakers</span>
                      <span className="text-brand font-mono font-bold">85%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">Zero Payload Answer Stripping</span>
                      <span className="text-amber-600 font-mono font-bold">72%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs text-slate-600 shadow-sm">
                <div className="font-bold text-slate-900 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span>Cohort Intervention Alerts</span>
                </div>
                <p>
                  Instructors receive immediate flags when more than 25% of students miss a single question topic, identifying concepts requiring review before term examinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 3: DENSE-RANK LEADERBOARD */}
      <section className="py-20 border-b border-slate-200 bg-white">
        <div className="page-wrap space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-wider">
              Student Recognition
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Dense ranking eliminates artificial rank gaps for tied students.
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard leaderboards skip numbers when two students tie for first place. VidyaFlow uses dense ranking: students with equal accuracy share the same podium place without penalizing the next finisher.
            </p>
          </div>

          {/* Leaderboard Table & Podium Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Top 3 Podium Cards */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-card">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Current Term 2 Class Podium</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>

                <div className="grid grid-cols-3 gap-3 items-end pt-2 text-center">
                  {/* #2 Rank */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-7 h-7 rounded-full bg-slate-200 font-mono font-bold text-xs inline-flex items-center justify-center text-slate-800 mx-auto">
                      2
                    </span>
                    <div className="font-bold text-slate-900 text-xs truncate">Beatriz Morales</div>
                    <div className="font-mono text-xs text-slate-600 tabular-nums">80%</div>
                  </div>

                  {/* #1 Rank (Gold) */}
                  <div className="p-4 rounded-lg bg-amber-50 border-2 border-amber-300 space-y-1 -mt-4 shadow-sm">
                    <span className="w-8 h-8 rounded-full bg-amber-500 font-mono font-bold text-sm inline-flex items-center justify-center text-white mx-auto shadow-xs">
                      1
                    </span>
                    <div className="font-bold text-slate-900 text-xs truncate">Alex Chen</div>
                    <div className="font-mono text-xs font-bold text-amber-700 tabular-nums">100%</div>
                  </div>

                  {/* #3 Rank */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <span className="w-7 h-7 rounded-full bg-slate-200 font-mono font-bold text-xs inline-flex items-center justify-center text-slate-800 mx-auto">
                      3
                    </span>
                    <div className="font-bold text-slate-900 text-xs truncate">Chloe Dupont</div>
                    <div className="font-mono text-xs text-slate-600 tabular-nums">60%</div>
                  </div>
                </div>
              </div>

              {/* Integrity Protection Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Single-Attempt Verification</span>
                </div>
                <p>
                  Database row serialization guarantees each enrolled student submits an assessment attempt exactly once, eliminating duplicate scores or race condition exploits.
                </p>
              </div>
            </div>

            {/* Feature Ledger */}
            <div className="lg:col-span-6 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-card">
                <h3 className="font-bold text-slate-900 text-base">Key Academic Protections</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Zero Answer Key Leakage</span>
                      <p className="text-slate-600 mt-0.5">
                        Answer keys are stripped before delivery to student browsers. Inspecting developer tools reveals only question text and option identifiers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Instant Leaderboard Synchronization</span>
                      <p className="text-slate-600 mt-0.5">
                        Submissions calculate scores atomically, giving students immediate feedback without table scan latency.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">Immediate Question Review</span>
                      <p className="text-slate-600 mt-0.5">
                        Upon test conclusion, students immediately inspect their choices alongside correct explanations to reinforce curriculum retention.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 4: ROLE SELECTION SCREEN ("Experience the school portal in two roles") */}
      <section className="py-24 bg-slate-50">
        <div className="page-wrap max-w-4xl space-y-10 text-center">
          <div className="space-y-3">
            <span className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
              Dual Persona Access
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Experience the school portal in two roles.
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Choose an account to author assessments and review class cohort analytics, or take tests as an enrolled student.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            {/* Faculty Launch Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-light text-brand border border-brand-border">
                    Instructor Portal
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Full Authoring &amp; Analytics
                  </span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/8] bg-slate-100 shadow-xs">
                  <img
                    src="/assets/teacher_student_siting.jpg"
                    alt="Instructor mentoring students"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-2.5">
                    <span className="text-[10px] font-mono text-white font-bold">Faculty Mentorship Workspace</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand transition-colors">
                    Dr. Alan Turing
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Lead Faculty &bull; Computer Science Department
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Compose four-option multiple-choice tests, batch assign class rosters, and monitor real-time student accuracy distributions across mastery tiers.
                </p>

                {/* Feature Checklist */}
                <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-brand-light text-brand flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>4-option MCQ authoring with single key</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-brand-light text-brand flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Batch cohort roster assignment</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-brand-light text-brand flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Real-time mastery band distributions</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => switchDemoUser('TEACHER')}
                className="w-full py-3.5 px-5 rounded-lg text-xs font-bold bg-brand text-white hover:bg-brand-hover shadow-brand transition-all flex items-center justify-center space-x-2 btn-tactile cursor-pointer"
              >
                <span>Launch Faculty Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Launch Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-6 flex flex-col justify-between shadow-card hover:shadow-card-hover hover:border-slate-300 transition-all group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-light text-emerald-700 border border-emerald-border">
                    Student Portal
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Enrolled Student Hub
                  </span>
                </div>

                <div className="relative rounded-lg overflow-hidden border border-slate-200 aspect-[16/8] bg-slate-100 shadow-xs">
                  <img
                    src="/assets/test_paper_on_table.jpg"
                    alt="Active examination desk"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent flex items-end p-2.5">
                    <span className="text-[10px] font-mono text-white font-bold">Anti-Leak Examination Desk</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Alex Chen
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Enrolled Student 1 &bull; Active Cohort
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Take assigned curriculum tests in a clean distraction-free room, inspect instant score reports with detailed explanations, and review your dense rank.
                </p>

                {/* Feature Checklist */}
                <ul className="space-y-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-light text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Distraction-free test environment</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-light text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Instant question-by-question review</span>
                  </li>
                  <li className="flex items-center space-x-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-light text-emerald-700 flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                    <span>Dense-rank class leaderboard standing</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => switchDemoUser('STUDENT', '1')}
                className="w-full py-3.5 px-5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald transition-all flex items-center justify-center space-x-2 btn-tactile cursor-pointer"
              >
                <span>Launch Student Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
