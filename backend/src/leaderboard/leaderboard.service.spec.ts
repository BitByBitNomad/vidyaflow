import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Role } from '@prisma/client';

describe('LeaderboardService (Requirement 5)', () => {
  let service: LeaderboardService;
  let prisma: any;
  let redisService: any;

  const mockQuizId = 'quiz-lead-1';

  beforeEach(async () => {
    prisma = {
      quiz: {
        findUnique: jest.fn().mockResolvedValue({
          id: mockQuizId,
          title: 'Distributed Systems & Database Concurrency',
          teacherId: 'teacher-1',
          teacher: { id: 'teacher-1', name: 'Dr. Turing' },
        }),
      },
      quizAssignment: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'assign-1',
          quizId: mockQuizId,
          studentId: 'student-1',
        }),
      },
      $queryRaw: jest.fn(),
    };

    redisService = {
      zadd: jest.fn().mockResolvedValue(1),
      zrevrangeWithScores: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        { provide: PrismaService, useValue: prisma },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
  });

  // TEST 5: Correct leaderboard ranking for students with equal scores
  describe('Test 5: Dense Ranking with equal scores', () => {
    it('should assign identical ranks to students with equal accuracy (Dense Ranking)', async () => {
      // Mocking 4 students: Student 1 & 2 tie at 100%, Student 3 has 75%, Student 4 has 50%
      const mockRawRows = [
        {
          attemptId: 'att-1',
          studentId: 'student-1',
          studentName: 'Alex Chen',
          correctAnswers: 4,
          totalQuestions: 4,
          accuracyPercentage: 100,
          completedAt: new Date('2026-11-23T10:00:00Z'),
          denseRank: 1, // Tie 1
        },
        {
          attemptId: 'att-2',
          studentId: 'student-2',
          studentName: 'Beatriz Morales',
          correctAnswers: 4,
          totalQuestions: 4,
          accuracyPercentage: 100,
          completedAt: new Date('2026-11-23T10:05:00Z'),
          denseRank: 1, // Tie 1
        },
        {
          attemptId: 'att-3',
          studentId: 'student-3',
          studentName: 'Chloe Dupont',
          correctAnswers: 3,
          totalQuestions: 4,
          accuracyPercentage: 75,
          completedAt: new Date('2026-11-23T10:10:00Z'),
          denseRank: 2, // Next rank is 2 (Dense, NOT 3)
        },
        {
          attemptId: 'att-4',
          studentId: 'student-4',
          studentName: 'Devon Vance',
          correctAnswers: 2,
          totalQuestions: 4,
          accuracyPercentage: 50,
          completedAt: new Date('2026-11-23T10:15:00Z'),
          denseRank: 3, // Rank 3
        },
      ];

      prisma.$queryRaw.mockResolvedValue(mockRawRows);

      const result = await service.getQuizLeaderboard(
        mockQuizId,
        'student-1',
        Role.STUDENT,
      );

      expect(result).toBeDefined();
      expect(result.totalParticipants).toBe(4);
      expect(result.leaderboard).toHaveLength(4);

      // Verify Student 1 (Alex) and Student 2 (Beatriz) have equal rank 1
      expect(result.leaderboard[0].studentName).toBe('Alex Chen');
      expect(result.leaderboard[0].rank).toBe(1);
      expect(result.leaderboard[0].accuracyPercentage).toBe(100);

      expect(result.leaderboard[1].studentName).toBe('Beatriz Morales');
      expect(result.leaderboard[1].rank).toBe(1);
      expect(result.leaderboard[1].accuracyPercentage).toBe(100);

      // Verify Student 3 receives dense rank 2 (not 3)
      expect(result.leaderboard[2].studentName).toBe('Chloe Dupont');
      expect(result.leaderboard[2].rank).toBe(2);
      expect(result.leaderboard[2].accuracyPercentage).toBe(75);

      // Verify Student 4 receives dense rank 3
      expect(result.leaderboard[3].studentName).toBe('Devon Vance');
      expect(result.leaderboard[3].rank).toBe(3);

      // Verify current student highlight flag
      expect(result.leaderboard[0].isCurrentUser).toBe(true);
      expect(result.leaderboard[1].isCurrentUser).toBe(false);
      expect(result.myRank).toBe(1);
    });
  });
});
