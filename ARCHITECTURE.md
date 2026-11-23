# VidyaFlow: System Architecture & Engineering Design Decisions

> **Platform Creator & Lead Engineer:** BitByBitNomad  
> **Brand Etymology:** Fusion of Sanskrit ***Vidya*** (विद्या — sacred knowledge, intellect & learning mastery) + English ***Flow*** (real-time stream of analytics & continuous learning progression).

This document details the architectural choices, scalability strategies, database concurrency controls, caching patterns, and security mechanisms implemented in the **VidyaFlow Quiz-Based Learning & Analytics Platform**, built by **BitByBitNomad**.

---

## 1. System Topology & Request Lifecycle

```
[ Next.js 14 Frontend (App Router) ]
         │
         │  HTTPS / REST (JWT Bearer Token in Authorization Header)
         ▼
[ NestJS 10 API Gateway & Application Server ]
 ├── Global Security: Helmet, CORS, Global Exception Filter
 ├── Rate Limiting: ThrottlerGuard (Brute-force / Spammer protection)
 ├── Authentication & Authorization:
 │     ├── JwtAuthGuard (Validates Supabase / Dual-Mode JWT signature)
 │     └── RolesGuard (Enforces RBAC: @Roles(Role.TEACHER) vs @Roles(Role.STUDENT))
 ├── Domain Services: Quizzes, Assignments, Attempts, Leaderboard, Analytics
 └── Persistence & Cache Layers:
       ├── PostgreSQL (Prisma ORM): ACID Source of Truth + Row-Level Locking
       └── Redis 7: High-Throughput Write-Through Cache & Sorted Set Leaderboards
```

---

## 2. Concurrency Control: Row-Level Locking (`SELECT ... FOR UPDATE`)

### The Challenge
In educational testing platforms, duplicate submissions and race conditions are frequent challenges:
1. A student double-clicks the "Submit Quiz" button rapidly on high latency networks.
2. A malicious actor script sends concurrent submission requests in parallel to corrupt scores or exploit timing windows.
3. If concurrent requests read `assignment.status === 'PENDING'` simultaneously before either writes `'COMPLETED'`, both could pass validation and insert duplicate rows into `student_attempts`.

### Our Solution: Pessimistic Row-Level Locking
Rather than relying purely on client-side state or optimistic checks, we implement database-level **Pessimistic Concurrency Control** within an ACID transaction (`prisma.$transaction`):

```sql
SELECT "id", "status", "quiz_id", "student_id" 
FROM "quiz_assignments" 
WHERE "quiz_id" = $1 AND "student_id" = $2 
FOR UPDATE;
```

#### Why `FOR UPDATE`?
- **Row Serialization**: The database engine acquires an exclusive lock on the matching row in `quiz_assignments`.
- **Race Condition Prevention**: Any concurrent transaction attempting to submit the same assignment is forced into a waiting queue until the first transaction commits or aborts.
- **Immediate Rejection**: As soon as the first transaction commits and updates the status to `'COMPLETED'`, the queued second transaction reads `'COMPLETED'` and immediately throws `BadRequestException` (`"Rejection: This quiz assignment has already been completed and submitted."`).
- **Database Defense-in-Depth**: In addition to row locking, the PostgreSQL schema enforces composite unique constraints:
  - `@@unique([quizId, studentId])` on `quiz_assignments`
  - `@@unique([quizId, studentId])` on `student_attempts`
  - `@@unique([assignmentId])` on `student_attempts`

---

## 3. Leaderboard Architecture: Redis Write-Through vs. Write-Behind

### The Assessment Question
*"Use redis for leaderboard with either write-behind, read or other way round whichever is optimized and production-grade as per this scenario and project challenges."*

### Architectural Evaluation

| Caching Pattern | Mechanism | Pros | Cons in this Quiz Scenario |
| :--- | :--- | :--- | :--- |
| **Write-Behind (Write-Back)** | App writes to Redis first; an asynchronous background worker drains a queue into PostgreSQL later. | Very low write latency. | **Eventual consistency lag**: When a student submits an exam, they are immediately redirected to the results and leaderboard screen. If the queue is delayed or fails, their attempt is missing or lost on Redis restart. Not acceptable for high-stakes examinations. |
| **Write-Through (Chosen)** | Attempt is committed to PostgreSQL in an ACID transaction, and **immediately written through** to the Redis Sorted Set (`ZADD`) before returning the response. | **Zero read latency**, **instant consistency**, **100% durability** backed by PostgreSQL ACID transactions. | Marginal extra millisecond on write, well worth the guaranteed correctness and immediate visibility. |

### Why Write-Through is Superior Here:
1. **Immediate User Feedback**: Students expect to see their rank immediately upon submission. With Write-Through, the score is already in Redis when the redirect hits `/student/leaderboard/:id`.
2. **Durability First**: PostgreSQL holds the immutable audit trail and answers. If Redis ever crashes, restarts, or evicts memory under pressure, the Leaderboard Service gracefully falls back to PostgreSQL without data loss.
3. **Microsecond Retrieval**: Fetching leaderboard standings executes in $\mathcal{O}(\log(N) + M)$ using Redis Sorted Sets or indexed PostgreSQL window functions.

---

## 4. Leaderboard Ranking: Dense Ranking (`DENSE_RANK()`)

### The Requirement
*"Rank students by accuracy, highest first... Students with equal accuracy should receive equal ranks."*

### Standard Competition Ranking vs. Dense Ranking:

- **Standard Competition (Rank)**: Tied ranks cause consecutive numbers to be skipped.
  - Student A (100%): Rank 1
  - Student B (100%): Rank 1
  - Student C (75%): Rank 3 ❌ (Rank 2 was skipped)

- **Dense Ranking (DENSE_RANK)**: Tied ranks share the same number, but subsequent ranks increment by 1.
  - Student A (100%): Rank 1
  - Student B (100%): Rank 1
  - Student C (75%): Rank 2 ✅ (No ranks skipped)
  - Student D (50%): Rank 3

We compute Dense Ranking using PostgreSQL's analytical window function with fallback to Redis:
```sql
SELECT 
  sa."student_id" as "studentId",
  u."name" as "studentName",
  sa."accuracy" as "accuracyPercentage",
  DENSE_RANK() OVER (ORDER BY sa."accuracy" DESC) as "denseRank"
FROM "student_attempts" sa
JOIN "users" u ON sa."student_id" = u."id"
WHERE sa."quiz_id" = $1
ORDER BY "denseRank" ASC, sa."completed_at" ASC;
```

---

## 5. Security & Anti-Leakage Precautions

1. **Answer Key Protection**:
   - When a student requests a quiz via `GET /quizzes/:id/attempt`, the backend query **explicitly excludes** the `isCorrect` boolean from `question_options`.
   - Inspection of browser DevTools network tab reveals **zero answer keys** before submission.
   - Only after submission does `GET /attempts/:id/result` reveal the correct option along with detailed review.

2. **Role-Based Access Control (RBAC)**:
   - Every protected route enforces `@UseGuards(JwtAuthGuard, RolesGuard)` with metadata decorators (`@Roles(Role.TEACHER)`).
   - Students cannot call quiz authoring, assignment creation, student roster retrieval, or teacher analytics. Violations trigger an immediate `403 Forbidden`.

3. **Ownership Authorization**:
   - A teacher can only assign quizzes that they personally created (`quiz.teacherId === teacher.id`).
   - A student can only submit quizzes they have an active assignment for.

4. **API Rate Limiting & Exploitation Prevention**:
   - Configured via `@nestjs/throttler` with a default of 100 requests/minute.
   - Specific sensitive endpoints (e.g. `/api/auth/register`, `/api/auth/login`) are tightened to 10-20 requests/minute to prevent brute-force attacks and credential stuffing.
   - HTTP security headers provided by `helmet()`.

5. **Input Validation & Sanitization**:
   - Global `ValidationPipe` with `whitelist: true` strips unexpected properties and protects against parameter injection attacks.

---

## 6. Supabase Dual-Mode Authentication

To accommodate both cloud deployments with Supabase and fully offline local evaluation:
- The system supports Supabase Auth tokens signed with the project's JWT Secret.
- It concurrently provides built-in fallback authentication (`/api/auth/login`, `/api/auth/demo-login`) using standard HS256 JWT tokens.
- Reviewers can evaluate the application out-of-the-box without provisioning an external Supabase instance.
