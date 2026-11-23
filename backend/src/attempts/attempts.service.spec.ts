import { Test, TestingModule } from '@nestjs/testing';
import { AttemptsService } from './attempts.service';
import { PrismaService } from '../prisma/prisma.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AssignmentStatus } from '@prisma/client';

describe('AttemptsService (Requirements 1, 2, 3)', () => {
  let service: AttemptsService;
  let prisma: any;
  let leaderboardService: any;

  const mockQuizId = 'quiz-uuid-1';
  const mockStudentId = 'student-uuid-1';
  const mockAssignmentId = 'assignment-uuid-1';

  const mockQuestions = [
    {
      id: 'q1',
      questionText: 'What is 2+2?',
      options: [
        { id: 'opt1', optionLabel: 'A', optionText: '3', isCorrect: false },
        { id: 'opt2', optionLabel: 'B', optionText: '4', isCorrect: true },
      ],
    },
    {
      id: 'q2',
      questionText: 'What is 5*5?',
      options: [
        { id: 'opt3', optionLabel: 'A', optionText: '25', isCorrect: true },
        { id: 'opt4', optionLabel: 'B', optionText: '30', isCorrect: false },
      ],
    },
  ];

  beforeEach(async () => {
    prisma = {
      $transaction: jest.fn(),
      studentAttempt: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      quizAssignment: {
        update: jest.fn(),
      },
      submittedAnswer: {
        createMany: jest.fn(),
      },
    };

    leaderboardService = {
      recordAttemptScore: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttemptsService,
        { provide: PrismaService, useValue: prisma },
        { provide: LeaderboardService, useValue: leaderboardService },
      ],
    }).compile();

    service = module.get<AttemptsService>(AttemptsService);
  });

  // TEST 1: Successful quiz submission and score calculation
  describe('Test 1: Successful quiz submission and score calculation', () => {
    it('should calculate 100% score when all answers are correct and update Redis leaderboard', async () => {
      // Setup transaction mock
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          $queryRaw: jest.fn().mockResolvedValue([
            {
              id: mockAssignmentId,
              status: AssignmentStatus.PENDING,
              quiz_id: mockQuizId,
              student_id: mockStudentId,
            },
          ]),
          studentAttempt: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'attempt-1',
              score: 2,
              totalQuestions: 2,
              accuracy: 100,
              completedAt: new Date(),
            }),
          },
          question: {
            findMany: jest.fn().mockResolvedValue(mockQuestions),
          },
          submittedAnswer: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          quizAssignment: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const submissionDto = {
        answers: [
          { questionId: 'q1', selectedOptionId: 'opt2' }, // Correct
          { questionId: 'q2', selectedOptionId: 'opt3' }, // Correct
        ],
      };

      const result = await service.submitQuizAttempt(
        mockQuizId,
        mockStudentId,
        submissionDto,
      );

      expect(result).toBeDefined();
      expect(result.totalQuestions).toBe(2);
      expect(result.correctAnswers).toBe(2);
      expect(result.incorrectAnswers).toBe(0);
      expect(result.accuracyPercentage).toBe(100);
      expect(result.quizCompletionStatus).toBe('COMPLETED');
      expect(leaderboardService.recordAttemptScore).toHaveBeenCalledWith(
        mockQuizId,
        mockStudentId,
        100,
      );
    });

    it('should calculate partial score correctly when some answers are incorrect', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          $queryRaw: jest.fn().mockResolvedValue([
            {
              id: mockAssignmentId,
              status: AssignmentStatus.PENDING,
              quiz_id: mockQuizId,
              student_id: mockStudentId,
            },
          ]),
          studentAttempt: {
            findUnique: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue({
              id: 'attempt-2',
              score: 1,
              totalQuestions: 2,
              accuracy: 50,
              completedAt: new Date(),
            }),
          },
          question: {
            findMany: jest.fn().mockResolvedValue(mockQuestions),
          },
          submittedAnswer: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
          quizAssignment: {
            update: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const submissionDto = {
        answers: [
          { questionId: 'q1', selectedOptionId: 'opt2' }, // Correct
          { questionId: 'q2', selectedOptionId: 'opt4' }, // Incorrect
        ],
      };

      const result = await service.submitQuizAttempt(
        mockQuizId,
        mockStudentId,
        submissionDto,
      );

      expect(result.correctAnswers).toBe(1);
      expect(result.incorrectAnswers).toBe(1);
      expect(result.accuracyPercentage).toBe(50);
    });
  });

  // TEST 2: Rejection of a second submission for the same assignment
  describe('Test 2: Rejection of a second submission for the same assignment', () => {
    it('should reject with BadRequestException when assignment status is already COMPLETED', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          $queryRaw: jest.fn().mockResolvedValue([
            {
              id: mockAssignmentId,
              status: AssignmentStatus.COMPLETED, // Already completed!
              quiz_id: mockQuizId,
              student_id: mockStudentId,
            },
          ]),
        };
        return callback(tx);
      });

      const submissionDto = {
        answers: [{ questionId: 'q1', selectedOptionId: 'opt2' }],
      };

      await expect(
        service.submitQuizAttempt(mockQuizId, mockStudentId, submissionDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject with BadRequestException when attempt record already exists in database', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          $queryRaw: jest.fn().mockResolvedValue([
            {
              id: mockAssignmentId,
              status: AssignmentStatus.PENDING,
              quiz_id: mockQuizId,
              student_id: mockStudentId,
            },
          ]),
          studentAttempt: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'existing-attempt-id',
            }),
          },
        };
        return callback(tx);
      });

      const submissionDto = {
        answers: [{ questionId: 'q1', selectedOptionId: 'opt2' }],
      };

      await expect(
        service.submitQuizAttempt(mockQuizId, mockStudentId, submissionDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // TEST 3: Rejection when a student attempts an unassigned quiz
  describe('Test 3: Rejection when a student attempts an unassigned quiz', () => {
    it('should reject with ForbiddenException when student is not in quiz_assignments', async () => {
      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          // Empty result: student is not assigned
          $queryRaw: jest.fn().mockResolvedValue([]),
        };
        return callback(tx);
      });

      const submissionDto = {
        answers: [{ questionId: 'q1', selectedOptionId: 'opt2' }],
      };

      await expect(
        service.submitQuizAttempt('unassigned-quiz-id', mockStudentId, submissionDto),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
