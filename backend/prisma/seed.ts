import { PrismaClient, Role, AssignmentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding VidyaFlow database (Platform by BitByBitNomad)...');

  // Hash shared demo password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Password123!', salt);

  // 1. Create Teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@vidyaflow.ai' },
    update: { passwordHash },
    create: {
      email: 'teacher@vidyaflow.ai',
      name: 'Dr. Alan Turing (Teacher)',
      role: Role.TEACHER,
      passwordHash,
    },
  });
  console.log(`Teacher seeded: ${teacher.email}`);

  // 2. Create Students
  const studentData = [
    { email: 'student1@vidyaflow.ai', name: 'Alex Chen' },
    { email: 'student2@vidyaflow.ai', name: 'Beatriz Morales' },
    { email: 'student3@vidyaflow.ai', name: 'Chloe Dupont' },
    { email: 'student4@vidyaflow.ai', name: 'Devon Vance' },
    { email: 'student5@vidyaflow.ai', name: 'Elena Rostova' },
  ];

  const students = [];
  for (const s of studentData) {
    const student = await prisma.user.upsert({
      where: { email: s.email },
      update: { passwordHash },
      create: {
        email: s.email,
        name: s.name,
        role: Role.STUDENT,
        passwordHash,
      },
    });
    students.push(student);
    console.log(`Student seeded: ${student.email}`);
  }

  // 3. Create Demo Quiz 1: Data Structures & High-Scale Backend Systems
  let quiz1 = await prisma.quiz.findFirst({
    where: { title: 'Distributed Systems & Database Concurrency' },
  });

  if (!quiz1) {
    quiz1 = await prisma.quiz.create({
      data: {
        title: 'Distributed Systems & Database Concurrency',
        description: 'Test your understanding of ACID transactions, row-level locking, Redis caching patterns, and high-concurrency architecture.',
        teacherId: teacher.id,
        questions: {
          create: [
            {
              questionText: 'Which PostgreSQL clause prevents double-spending or duplicate submission race conditions by acquiring an exclusive row lock?',
              orderIndex: 1,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'SELECT ... FOR UPDATE', isCorrect: true },
                  { optionLabel: 'B', optionText: 'SELECT ... WITH LOCK', isCorrect: false },
                  { optionLabel: 'C', optionText: 'LOCK TABLE EXCLUSIVE', isCorrect: false },
                  { optionLabel: 'D', optionText: 'SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED', isCorrect: false },
                ],
              },
            },
            {
              questionText: 'Why is Write-Through caching preferred over Write-Behind in exam leaderboard submissions?',
              orderIndex: 2,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'It provides immediate read consistency and eliminates lag when the student views ranks after submission', isCorrect: true },
                  { optionLabel: 'B', optionText: 'It requires zero memory usage in Redis', isCorrect: false },
                  { optionLabel: 'C', optionText: 'It allows bypassing database constraints completely', isCorrect: false },
                  { optionLabel: 'D', optionText: 'It avoids network I/O to the primary database', isCorrect: false },
                ],
              },
            },
            {
              questionText: 'What is the time complexity of adding a score to a Redis Sorted Set (ZADD) with N elements?',
              orderIndex: 3,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'O(log(N))', isCorrect: true },
                  { optionLabel: 'B', optionText: 'O(1)', isCorrect: false },
                  { optionLabel: 'C', optionText: 'O(N)', isCorrect: false },
                  { optionLabel: 'D', optionText: 'O(N log(N))', isCorrect: false },
                ],
              },
            },
            {
              questionText: 'Under Dense Ranking (DENSE_RANK), if two students tie for rank 1, what rank does the next student receive?',
              orderIndex: 4,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'Rank 2 (no ranks are skipped in dense ranking)', isCorrect: true },
                  { optionLabel: 'B', optionText: 'Rank 3 (ranks are skipped like Olympic medals)', isCorrect: false },
                  { optionLabel: 'C', optionText: 'Rank 1.5 (average of tied ranks)', isCorrect: false },
                  { optionLabel: 'D', optionText: 'Null (ties cause disqualification)', isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`Quiz 1 seeded: ${quiz1.title}`);
  }

  // Assign Quiz 1 to Student 1, 2, 3
  const q1Students = [students[0], students[1], students[2]];
  for (const s of q1Students) {
    await prisma.quizAssignment.upsert({
      where: {
        quizId_studentId: {
          quizId: quiz1.id,
          studentId: s.id,
        },
      },
      update: {},
      create: {
        quizId: quiz1.id,
        studentId: s.id,
        assignedById: teacher.id,
        status: AssignmentStatus.PENDING,
      },
    });
  }

  // 4. Create Demo Quiz 2: Modern Full-Stack Architecture (Next.js & NestJS)
  let quiz2 = await prisma.quiz.findFirst({
    where: { title: 'Modern Full-Stack Engineering with Next.js & NestJS' },
  });

  if (!quiz2) {
    quiz2 = await prisma.quiz.create({
      data: {
        title: 'Modern Full-Stack Engineering with Next.js & NestJS',
        description: 'Evaluate mastery of NestJS modular architecture, Dependency Injection, Supabase JWT validation, and Next.js App Router patterns.',
        teacherId: teacher.id,
        questions: {
          create: [
            {
              questionText: 'In NestJS, which decorator binds custom metadata used by execution context guards (like RolesGuard)?',
              orderIndex: 1,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'SetMetadata() or Reflector.createDecorator()', isCorrect: true },
                  { optionLabel: 'B', optionText: '@Injectable()', isCorrect: false },
                  { optionLabel: 'C', optionText: '@Header()', isCorrect: false },
                  { optionLabel: 'D', optionText: '@Param()', isCorrect: false },
                ],
              },
            },
            {
              questionText: 'How should sensitive Supabase service-role keys be handled in a production full-stack application?',
              orderIndex: 2,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'Kept strictly on the backend environment and never exposed to client-side bundles', isCorrect: true },
                  { optionLabel: 'B', optionText: 'Exposed via NEXT_PUBLIC_SUPABASE_SERVICE_KEY in Next.js', isCorrect: false },
                  { optionLabel: 'C', optionText: 'Embedded in git commit messages for transparency', isCorrect: false },
                  { optionLabel: 'D', optionText: 'Sent in query parameters of frontend requests', isCorrect: false },
                ],
              },
            },
            {
              questionText: 'What is the primary role of Next.js App Router Server Components?',
              orderIndex: 3,
              options: {
                create: [
                  { optionLabel: 'A', optionText: 'Render on the server with zero client bundle impact and direct data access', isCorrect: true },
                  { optionLabel: 'B', optionText: 'Handle client-side onClick and useState interactions', isCorrect: false },
                  { optionLabel: 'C', optionText: 'Replace PostgreSQL database indexing', isCorrect: false },
                  { optionLabel: 'D', optionText: 'Emulate browser localStorage on the server', isCorrect: false },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`Quiz 2 seeded: ${quiz2.title}`);
  }

  // Assign Quiz 2 to Student 1, 3, 4
  const q2Students = [students[0], students[2], students[3]];
  for (const s of q2Students) {
    await prisma.quizAssignment.upsert({
      where: {
        quizId_studentId: {
          quizId: quiz2.id,
          studentId: s.id,
        },
      },
      update: {},
      create: {
        quizId: quiz2.id,
        studentId: s.id,
        assignedById: teacher.id,
        status: AssignmentStatus.PENDING,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
