import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get comprehensive performance analytics for a specific quiz (Teacher only)
   */
  async getQuizAnalytics(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          select: { id: true, questionText: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to analytics for this quiz.');
    }

    const assignments = await this.prisma.quizAssignment.findMany({
      where: { quizId },
      include: {
        student: {
          select: { id: true, name: true, email: true },
        },
        attempt: {
          select: {
            id: true,
            score: true,
            totalQuestions: true,
            accuracy: true,
            completedAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'asc' },
    });

    const totalAssigned = assignments.length;
    const completedAssignments = assignments.filter((a) => a.attempt !== null);
    const totalCompleted = completedAssignments.length;
    const pendingCount = totalAssigned - totalCompleted;

    const totalAccuracySum = completedAssignments.reduce(
      (sum, a) => sum + (a.attempt?.accuracy || 0),
      0,
    );
    const averageQuizAccuracy =
      totalCompleted > 0
        ? Math.round((totalAccuracySum / totalCompleted) * 10) / 10
        : 0;

    // Student-wise breakdown
    const studentBreakdown = assignments.map((a) => ({
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      completionStatus: a.status,
      assignedAt: a.assignedAt,
      score: a.attempt ? a.attempt.score : null,
      totalQuestions: a.attempt ? a.attempt.totalQuestions : quiz.questions.length,
      accuracyPercentage: a.attempt ? a.attempt.accuracy : null,
      completedAt: a.attempt ? a.attempt.completedAt : null,
    }));

    return {
      quizId: quiz.id,
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      totalQuestions: quiz.questions.length,
      overview: {
        totalStudentsAssigned: totalAssigned,
        totalStudentsCompleted: totalCompleted,
        totalStudentsPending: pendingCount,
        completionRatePercentage:
          totalAssigned > 0
            ? Math.round((totalCompleted / totalAssigned) * 100)
            : 0,
        averageQuizAccuracy,
      },
      students: studentBreakdown,
    };
  }

  /**
   * Teacher overview dashboard analytics (aggregated across all teacher quizzes)
   */
  async getTeacherOverview(teacherId: string) {
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
          select: { accuracy: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalQuizzes = quizzes.length;
    const totalAssignedCount = quizzes.reduce(
      (acc, q) => acc + q._count.assignments,
      0,
    );
    const totalCompletedCount = quizzes.reduce(
      (acc, q) => acc + q._count.attempts,
      0,
    );

    const allAttempts = quizzes.flatMap((q) => q.attempts);
    const overallAvgAccuracy =
      allAttempts.length > 0
        ? Math.round(
            (allAttempts.reduce((acc, a) => acc + a.accuracy, 0) /
              allAttempts.length) *
              10,
          ) / 10
        : 0;

    return {
      totalQuizzes,
      totalAssignedCount,
      totalCompletedCount,
      overallAvgAccuracy,
      quizzes: quizzes.map((q) => ({
        id: q.id,
        title: q.title,
        description: q.description,
        totalQuestions: q._count.questions,
        totalAssigned: q._count.assignments,
        totalCompleted: q._count.attempts,
        averageAccuracy:
          q.attempts.length > 0
            ? Math.round(
                q.attempts.reduce((acc, a) => acc + a.accuracy, 0) /
                  q.attempts.length,
              )
            : 0,
        createdAt: q.createdAt,
      })),
    };
  }
}
