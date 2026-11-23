# VidyaFlow: Quiz-Based Learning & Analytics Platform

> **Engineered & Designed by BitByBitNomad**  
> **Brand Identity:** Sanskrit ***Vidya*** (विद्या — true knowledge, wisdom & cognitive mastery) + English ***Flow*** (real-time stream of analytics & continuous learning).

[![Author](https://img.shields.io/badge/Engineer-BitByBitNomad-6366F1?style=flat&logo=github&logoColor=white)](https://github.com/BitByBitNomad)
[![NestJS](https://img.shields.io/badge/NestJS-10.3-E0234E?style=flat&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat&logo=redis&logoColor=white)](https://redis.io/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat&logo=docker&logoColor=white)](https://www.docker.com/)

A production-grade, highly scalable full-stack learning and quiz analytics platform engineered by **BitByBitNomad**. The application implements strict **Role-Based Access Control (Teacher vs. Student)**, database **Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)** to prevent race conditions and duplicate submissions, **Server-Side Score Calculation**, and a high-throughput **Redis Write-Through Leaderboard with Dense Ranking**.

---

## Table of Contents
1. [Core Features & Assessment Requirements](#1-core-features--assessment-requirements)
2. [System Architecture & Design Decisions](#2-system-architecture--design-decisions)
3. [Technology Stack](#3-technology-stack)
4. [Database Schema & Concurrency Controls](#4-database-schema--concurrency-controls)
5. [Pre-Seeded Demo Credentials](#5-pre-seeded-demo-credentials)
6. [Quick Start with Docker Compose](#6-quick-start-with-docker-compose)
7. [Manual Local Setup Instructions](#7-manual-local-setup-instructions)
8. [Automated Testing Suite](#8-automated-testing-suite)
9. [REST API Documentation](#9-rest-api-documentation)
10. [Assumptions, Trade-Offs & Production Hardening](#10-assumptions-trade-offs--production-hardening)

---

## 1. Core Features & Assessment Requirements

| Module & Requirement | Implementation Detail | Status |
| :--- | :--- | :---: |
| **Authentication & Roles** | Dual-mode Supabase Auth + fallback JWT, Role-based route guards (`TEACHER`, `STUDENT`) | ✅ Complete |
| **Teacher: Quiz Creation** | Multi-question authoring, 4 options per question, single correct answer enforcement | ✅ Complete |
| **Teacher: Assignment** | Student roster view, multi-student selection, idempotent assignment, completion tracking | ✅ Complete |
| **Teacher: Analytics** | Enrolled count, completed count, average accuracy %, student-wise scores & mastery bands | ✅ Complete |
| **Student: Quiz Attempt** | Distraction-free interface, timer, progress bar, zero answer key leakage before submit | ✅ Complete |
| **Student: Submission Safety**| **Pessimistic Row-Level Locking (`FOR UPDATE`)** preventing duplicate concurrent submissions | ✅ Complete |
| **Student: Score & Review** | Server-side score & accuracy calculation, detailed question-by-question review | ✅ Complete |
| **Quiz Leaderboard** | **Redis Write-Through Cache**, Olympic Podium for top 3, **Dense Ranking (`DENSE_RANK`)** | ✅ Complete |
| **Security & Throttling** | NestJS Throttler rate limiting (10–20/min on auth), Helmet headers, CORS, payload validation | ✅ Complete |
| **Automated Tests** | 5 core scenarios verified with Jest unit, integration, and guard suites | ✅ Complete |

---

## 2. System Architecture & Design Decisions

```
               ┌────────────────────────────────────────────────────────┐
               │              Next.js 14 Client (App Router)            │
               │   - Teacher Console (/teacher/*)                       │
               │   - Student Testing Hub (/student/*)                   │
               │   - Dual Persona Switcher (Dr. Turing & Alex Chen)     │
               └───────────────────────────┬────────────────────────────┘
                                           │ REST API (Bearer JWT)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │                 NestJS Backend API Gateway             │
               │   - JwtAuthGuard (Supabase Auth / HS256 Token Engine)  │
               │   - RolesGuard (RBAC: TEACHER vs. STUDENT)             │
               │   - ThrottlerGuard (Rate Limiting on Sensitive Routes) │
               └───────────────┬────────────────────────┬───────────────┘
                               │                        │
          ACID Transactions    │                        │ Write-Through
          Row-Level Locking    │                        │ Sorted Sets (ZADD)
                               ▼                        ▼
               ┌────────────────────────┐      ┌────────────────────────┐
               │  Supabase PostgreSQL   │      │        Redis 7         │
               │  (Primary Data Store)  │      │  (High-Speed Cache &   │
               │   - Users & Roles      │      │    Live Leaderboard)   │
               │   - Quizzes & Options  │      └────────────────────────┘
               │   - Locked Attempts    │
               └────────────────────────┘
```

### A. Why Write-Through Cache for the Leaderboard?
We evaluated **Write-Through** vs. **Write-Behind (Write-Back)**:
- **Write-Behind** introduces an eventual consistency window where a student who submits an exam and is immediately redirected to the leaderboard will not see their score or will see stale ranks until the asynchronous background worker drains the queue. Additionally, Redis restart or queue failure can lead to lost updates.
- **Write-Through (Chosen)** commits the attempt to PostgreSQL within an ACID transaction and immediately writes through to Redis Sorted Sets (`ZADD`). This guarantees:
  1. **Zero-Lag Consistency**: The student sees their rank immediately upon submission.
  2. **100% Durability**: PostgreSQL is the immutable source of truth.
  3. **High Availability**: If Redis is offline or restarted, the Leaderboard Service gracefully falls back to PostgreSQL without error.

### B. Pessimistic Row-Level Locking (`SELECT ... FOR UPDATE`)
To prevent concurrent duplicate submissions (e.g., rapid double-clicking or scripted attacks), the attempt submission executes inside a database transaction:
```sql
SELECT "id", "status", "quiz_id", "student_id" 
FROM "quiz_assignments" 
WHERE "quiz_id" = $1 AND "student_id" = $2 
FOR UPDATE;
```
If a student attempts to submit concurrently, the database engine queues the second transaction. As soon as the first commits and marks the assignment `COMPLETED`, the second transaction inspects the status and immediately throws `BadRequestException`.

### C. Dense Ranking (`DENSE_RANK()`)
The assessment specifies: *"Students with equal accuracy should receive equal ranks."*  
Under standard competition ranking, equal ranks skip subsequent numbers (e.g., 1st, 1st, 3rd). Under **Dense Ranking**, equal scores receive equal rank without skipping (e.g., 1st, 1st, 2nd, 3rd). We enforce this with mathematical precision.

### D. Zero Answer Key Leakage
When students query `/api/quizzes/:id/attempt`, the backend query **strips `isCorrect`** from all options. Only after the student completes and submits their attempt does the result endpoint reveal correct options and explanations.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons.
- **Backend**: NestJS 10, TypeScript, Prisma ORM 5.22, Passport JWT, NestJS Throttler.
- **Database**: Supabase PostgreSQL 16 (connected via Supabase Connection Pooler).
- **Cache & Leaderboard**: Redis 7 (Sorted Sets with automatic in-memory fallback).
- **Authentication**: Modern Supabase Auth (`sb_publishable_...` and `sb_secret_...`) with internal HS256 fallback.
- **Containerization**: Docker, Docker Compose.

---

## 4. Database Schema & Concurrency Controls

The database utilizes a normalized schema with relational integrity, foreign key constraints, and unique compound indices:

- `users`: Stores user identity, display name, email, password hash, and `Role` (`TEACHER` or `STUDENT`).
- `quizzes`: Stores quiz title, description, and foreign key to authoring teacher.
- `questions`: Stores question prompt, topic, ordering, and foreign key to quiz.
- `question_options`: Stores four options per question and server-side `isCorrect` boolean.
- `quiz_assignments`: Links quizzes to students with compound unique key `(quiz_id, student_id)` and status (`PENDING` or `COMPLETED`).
- `student_attempts`: Records submission timestamp, score, total questions, and calculated accuracy percentage with unique constraint on `(quiz_id, student_id)`.
- `submitted_answers`: Persists student's selected option ID per question for question-by-question review.

---

## 5. Pre-Seeded Demo Credentials

The database comes pre-seeded with instructor and student accounts for immediate evaluation:

| Role | Name | Email | Password | Pre-Assigned Quizzes |
| :--- | :--- | :--- | :--- | :--- |
| **Teacher** | Dr. Alan Turing | `teacher@vidyaflow.ai` | `Password123!` | Authored 2 comprehensive quizzes |
| **Student 1** | Alex Chen | `student1@vidyaflow.ai` | `Password123!` | Completed (Score: 100%, Rank 1) |
| **Student 2** | Beatriz Morales | `student2@vidyaflow.ai` | `Password123!` | Completed (Score: 80%, Rank 2) |
| **Student 3** | Chloe Dupont | `student3@vidyaflow.ai` | `Password123!` | Assigned & Ready to Attempt |
| **Student 4** | Devon Vance | `student4@vidyaflow.ai` | `Password123!` | Assigned & Ready to Attempt |
| **Student 5** | Elena Rostova | `student5@vidyaflow.ai` | `Password123!` | Available in Roster |

> **Pro Tip**: Use the **Persona Switcher** in the top navigation bar to switch between Teacher and Student profiles with a single click.

---

## 6. Quick Start with Docker Compose

Run the entire platform (PostgreSQL, Redis, NestJS Backend, Next.js Frontend) with a single command:

```bash
# Clone the repository
git clone https://github.com/BitByBitNomad/vidyaflow.git
cd vidyaflow

# Start all containers
docker-compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:4000/api`

---

## 7. Manual Local Setup Instructions

### Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or Supabase project)
- Redis instance (optional: application includes automatic in-memory fallback)

### Step 1: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and SUPABASE keys if using Supabase

# Push schema to database
npx prisma db push

# Seed demo users, quizzes, and completed attempts
npm run prisma:seed

# Start backend in development mode
npm run start:dev
```
The NestJS backend will start on **`http://localhost:4000`**.

### Step 2: Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env.local

# Start frontend in development mode
npm run dev
```
The Next.js application will start on **`http://localhost:3000`**.

---

## 8. Automated Testing Suite

The backend includes comprehensive automated test suites covering all required scenarios:

```bash
cd backend
npm test
```

### Verified Test Cases
1. **Quiz Submission & Score Calculation**: Verifies server-side accuracy calculation and atomic Redis write-through.
2. **Duplicate Submission Prevention**: Verifies that repeated submissions for the same assignment are rejected with `400 BadRequest`.
3. **Unassigned Quiz Rejection**: Verifies that students attempting unassigned quizzes receive `403 Forbidden`.
4. **Role Authorization**: Verifies that student accounts cannot access teacher-only authoring or assignment endpoints.
5. **Dense Ranking Verification**: Verifies that students with equal scores receive equal rank without skipping positions.

---

## 9. REST API Documentation

All API endpoints are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

### Authentication & Users
- `POST /api/auth/register` — Register a new teacher or student account (Rate limited: 10/min)
- `POST /api/auth/login` — Sign in with email and password (Rate limited: 20/min)
- `POST /api/auth/demo-login` — Rapid one-click login for assessment evaluators
- `GET /api/auth/me` — Retrieve authenticated user profile
- `GET /api/users/students` — List enrolled students for quiz assignment (`TEACHER` only)

### Quizzes (`TEACHER`)
- `POST /api/quizzes` — Author a quiz with 4 options per question & correct answer (`TEACHER` only)
- `GET /api/quizzes/teacher` — List all quizzes authored by current teacher (`TEACHER` only)
- `GET /api/quizzes/teacher/:id` — View authored quiz with answer keys (`TEACHER` only)
- `GET /api/quizzes/:id/attempt` — Student endpoint to fetch questions (**strips `isCorrect`**)

### Assignments
- `POST /api/assignments` — Assign quiz to multiple student IDs (`TEACHER` only)
- `GET /api/assignments/my` — List all quizzes assigned to current student (`STUDENT` only)
- `GET /api/assignments/quiz/:quizId` — View student completion status for a quiz (`TEACHER` only)

### Attempts & Scoring
- `POST /api/attempts/:quizId/submit` — Submit quiz answers with **Row-Level Locking** (`STUDENT` only)
- `GET /api/attempts/:quizId/result` — Get detailed submission score and question review (`STUDENT` only)
- `GET /api/attempts/:quizId/result/:studentId` — View student submission details (`TEACHER` only)

### Leaderboard & Analytics
- `GET /api/leaderboard/quiz/:quizId` — Retrieve live **Redis Dense-Ranked Leaderboard**
- `GET /api/analytics/quiz/:quizId` — Get quiz completion rate and student accuracy roster (`TEACHER` only)
- `GET /api/analytics/overview` — High-level teacher analytics across all authored quizzes (`TEACHER` only)

---

## 10. Assumptions, Trade-Offs & Production Hardening

1. **Dual-Mode Authentication**:
   - *Design Choice*: The frontend supports Supabase Auth while the NestJS backend verifies Supabase JWT signatures. In addition, an internal HS256 auth engine is included so evaluators can test the entire platform without creating an external Supabase account.
2. **Redis In-Memory Fallback**:
   - *Design Choice*: The Redis service includes an automatic in-memory fallback. If a reviewer runs the backend without a Redis container running, the platform continues functioning without throwing unhandled connection errors.
3. **Pessimistic vs. Optimistic Locking**:
   - *Trade-Off*: Pessimistic Row-Level Locking (`FOR UPDATE`) incurs a brief database transaction lock, but provides 100% mathematical certainty against concurrent duplicate submissions in examination scenarios.
4. **Dense Ranking Scale**:
   - *Design Choice*: Analytical SQL `DENSE_RANK() OVER (ORDER BY accuracy DESC)` combined with Redis Sorted Set caching provides $\mathcal{O}(1)$ query times for classes and high-concurrency exam submissions.
