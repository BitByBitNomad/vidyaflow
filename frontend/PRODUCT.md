# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary User 1 — K-12 & Secondary Teachers / Instructors:** Managing classroom cohorts, authoring 4-option MCQs with single correct answer enforcement, assigning tests to enrolled class rosters, tracking turn-in/completion rates, and identifying students needing intervention through cohort mastery distribution analytics.
- **Primary User 2 — Middle & High School Students:** Taking assigned tests in a distraction-free, zero-leak environment with guaranteed single-attempt submission, reviewing question-by-question performance, and engaging with peer rankings via dense-rank school leaderboards.

## Product Purpose

VidyaFlow Academy is a specialized assessment intelligence and learning analytics platform for schools, engineered by BitByBitNomad. It replaces generic, unverified test tools with an integrity-first, distraction-free environment that gives teachers immediate cohort mastery analytics and gives students instant feedback and motivating dense-rank leaderboards. Success means 100% test completion visibility, zero technical cheating/leakage, and actionable grade insights that guide classroom intervention.

## Positioning

Unlike generic LMS quiz plug-ins or gamified trivia apps that compromise assessment rigor, VidyaFlow combines rigorous backend integrity (PostgreSQL ACID `FOR UPDATE` row-level locking preventing duplicate attempts, zero client-side answer key payload leakage, and sub-millisecond Redis write-through leaderboards) with a focused, distraction-free student testing environment and actionable cohort mastery distribution analytics.

## Operating Context

- Classrooms and computer labs during timed in-class assessments.
- Homework and asynchronous study review on school-issued or personal laptops/chromebooks.
- Faculty lesson planning and grade evaluation sessions where teachers review class-wide mastery bands (Exemplary, Proficient, Developing, Intervention) before unit exams.

## Capabilities and Constraints

- **Quiz Authoring:** 4-option multiple-choice questions with strict single-correct-answer validation.
- **Roster Management & Assignment:** Batch assignment workflows with real-time turn-in tracking and status badges (Not Assigned, Pending, Submitted).
- **Concurrency & Integrity:** PostgreSQL row-level locking ensures each student can submit an assessment attempt exactly once; student test payloads contain no correct-answer keys prior to submission.
- **Real-Time Analytics:** Cohort completion rate (%), class average mastery (%), and mastery bands distribution.
- **Dense-Rank Leaderboard:** Ties receive identical ranks without skipping numbers (1st, 1st, 2nd) powered by Redis sorted sets (`ZADD`).

## Brand Commitments

- **Name:** VidyaFlow (AI Assessment & Learning Analytics Suite) &bull; Built by BitByBitNomad.
- **Etymology:** Fusion of Sanskrit *Vidya* (विद्या - authentic learning, wisdom & knowledge) + English *Flow* (continuous mastery & real-time analytics data flow).
- **Creator / Engineer:** BitByBitNomad.
- **Voice:** Academic, authoritative, encouraging, and focused; free of distracting cartoonish clutter.
- **Visual Aesthetic:** Modern Academic SaaS: Crisp off-white / cool slate canvas (`#F8FAFC`) with elevated pure white cards, electric indigo primary brand accents (`#4F46E5`), emerald for student mastery/completion, amber for review alerts, and deep slate typography (`#0F172A`) paired with tabular numbers.

## Evidence on Hand

- Functional Next.js frontend with complete teacher & student workflows implemented in `src/app`.
- API endpoints configured in `src/lib/api.ts` connecting to NestJS backend with JWT auth and Supabase integration.
- Demo accounts seeded for immediate testing: Dr. Alan Turing (Teacher), Alex Chen (Student 1), Beatriz Morales (Student 2), Chloe Dupont (Student 3).

## Product Principles

1. **Integrity Without Friction:** Protect test security and concurrency at the database layer without burdening students or teachers with intrusive proctoring tools.
2. **Actionable Mastery Over Raw Scores:** Transform individual test submissions into immediate class cohort distributions (Exemplary, Proficient, Developing, Intervention) so teachers know exactly who needs support.
3. **Motivating, Fair Recognition:** Celebrate effort and accuracy with dense ranking where tied scores share rank, avoiding artificial gaps.
4. **Distraction-Free Focus:** Clean, calm UI surfaces that prioritize readability and deliberate choices during assessments.

## Accessibility & Inclusion

- Target WCAG 2.1 AA compliance with high-contrast text ratios across the dark theme.
- Keyboard-navigable question options and test forms.
- Reduced-motion support and distraction-free testing layout.
