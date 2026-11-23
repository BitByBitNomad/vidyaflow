import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { Role, AssignmentStatus } from '@prisma/client';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a quiz with multiple choice questions (Teacher only)
   */
  async createQuiz(teacherId: string, dto: CreateQuizDto) {
    // Validate that each question has exactly one correct answer
    for (let i = 0; i < dto.questions.length; i++) {
      const q = dto.questions[i];
      const correctCount = q.options.filter((opt) => opt.isCorrect).length;
      if (correctCount !== 1) {
        throw new BadRequestException(
          `Question ${i + 1} must have exactly one correct answer marked. Found: ${correctCount}.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: {
          title: dto.title,
          description: dto.description || '',
          teacherId,
        },
      });

      for (let i = 0; i < dto.questions.length; i++) {
        const qDto = dto.questions[i];
        const question = await tx.question.create({
          data: {
            quizId: quiz.id,
            questionText: qDto.questionText,
            orderIndex: i + 1,
          },
        });

        await tx.questionOption.createMany({
          data: qDto.options.map((opt, optIdx) => ({
            questionId: question.id,
            optionText: opt.optionText,
            optionLabel: opt.optionLabel || String.fromCharCode(65 + optIdx),
            isCorrect: opt.isCorrect,
          })),
        });
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            include: {
              options: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get all quizzes created by a teacher
   */
  async getTeacherQuizzes(teacherId: string) {
    const quizzes = await this.prisma.quiz.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: {
            questions: true,
            assignments: true,
            attempts: true,
          },
        },
        attempts: {
          select: {
            accuracy: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return quizzes.map((quiz) => {
      const completedCount = quiz.attempts.length;
      const avgAccuracy =
        completedCount > 0
          ? Math.round(
              quiz.attempts.reduce((acc, curr) => acc + curr.accuracy, 0) /
                completedCount,
            )
          : 0;

      return {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        isPublished: quiz.isPublished,
        createdAt: quiz.createdAt,
        totalQuestions: quiz._count.questions,
        totalAssigned: quiz._count.assignments,
        totalCompleted: completedCount,
        averageAccuracy: avgAccuracy,
      };
    });
  }

  /**
   * Get quiz details by ID (Teacher view: includes correct answers)
   */
  async getQuizForTeacher(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: 'asc' },
          include: {
            options: {
              orderBy: { optionLabel: 'asc' },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to view this quiz.');
    }

    return quiz;
  }

  /**
   * Get quiz details for a Student attempting the quiz.
   * SECURITY REQUIREMENT:
   * 1. Student must be assigned to this quiz.
   * 2. Student must not have already completed the quiz.
   * 3. Correct answer flags (isCorrect) MUST be omitted!
   */
  async getQuizForStudentAttempt(quizId: string, studentId: string) {
    // Check assignment
    const assignment = await this.prisma.quizAssignment.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
    });

    if (!assignment) {
      throw new ForbiddenException('You are not assigned to this quiz.');
    }

    if (assignment.status === AssignmentStatus.COMPLETED) {
      throw new BadRequestException('You have already completed this quiz.');
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        description: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            questionText: true,
            orderIndex: true,
            options: {
              orderBy: { optionLabel: 'asc' },
              select: {
                id: true,
                optionText: true,
                optionLabel: true,
                // Crucial security: isCorrect is EXCLUDED
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    return {
      ...quiz,
      assignmentId: assignment.id,
      totalQuestions: quiz.questions.length,
    };
  }
}
