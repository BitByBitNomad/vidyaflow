import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubmitAttemptDto } from "./dto/submit-attempt.dto";
import { LeaderboardService } from "../leaderboard/leaderboard.service";
import { AssignmentStatus } from "@prisma/client";

@Injectable()
export class AttemptsService {
  private readonly logger = new Logger(AttemptsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly leaderboardService: LeaderboardService,
  ) {}

  /**
   * Submit an attempt for a quiz with Row-Level Locking (Pessimistic Concurrency Control)
   * 1. Acquires a pessimistic row-level lock on the quiz_assignment row using FOR UPDATE
   * 2. Rejects if student is unassigned (ForbiddenException)
   * 3. Rejects duplicate submissions if assignment is already COMPLETED or attempt exists (BadRequestException)
   * 4. Calculates score and accuracy server-side
   * 5. Persists attempt and answers atomically in a transaction
   * 6. Writes through to Redis Leaderboard cache
   */
  async submitQuizAttempt(
    quizId: string,
    studentId: string,
    dto: SubmitAttemptDto,
  ) {
    // 1. Transaction with Row-Level Locking
    const result = await this.prisma.$transaction(async (tx) => {
      // Execute raw SQL query with 'FOR UPDATE' to lock the assignment row
      const lockedAssignments: any[] = await tx.$queryRaw`
        SELECT "id", "status", "quiz_id", "student_id" 
        FROM "quiz_assignments" 
        WHERE "quiz_id" = ${quizId} AND "student_id" = ${studentId} 
        FOR UPDATE;
      `;

      if (!lockedAssignments || lockedAssignments.length === 0) {
        throw new ForbiddenException(
          "Rejection: Student is not assigned to this quiz.",
        );
      }

      const assignment = lockedAssignments[0];

      // Check if assignment was already completed
      if (assignment.status === AssignmentStatus.COMPLETED) {
        throw new BadRequestException(
          "Rejection: This quiz assignment has already been completed and submitted.",
        );
      }

      // Check if attempt already exists in attempts table
      const existingAttempt = await tx.studentAttempt.findUnique({
        where: {
          quizId_studentId: {
            quizId,
            studentId,
          },
        },
      });

      if (existingAttempt) {
        throw new BadRequestException(
          "Rejection: A submission for this quiz assignment already exists.",
        );
      }

      // Fetch questions with correct answers to compute score securely on server
      const questions = await tx.question.findMany({
        where: { quizId },
        include: { options: true },
        orderBy: { orderIndex: "asc" },
      });

      if (!questions || questions.length === 0) {
        throw new BadRequestException("Quiz contains no questions.");
      }

      const totalQuestions = questions.length;
      let correctAnswersCount = 0;
      const submittedAnswersToInsert: Array<{
        questionId: string;
        selectedOptionId: string;
        isCorrect: boolean;
      }> = [];

      // Map submitted answers by questionId for fast lookup
      const answersMap = new Map<string, string>();
      for (const ans of dto.answers) {
        answersMap.set(ans.questionId, ans.selectedOptionId);
      }

      for (const question of questions) {
        const selectedOptionId = answersMap.get(question.id);
        if (!selectedOptionId) {
          throw new BadRequestException(
            `Missing answer for question: "${question.questionText.slice(0, 30)}..."`,
          );
        }

        const validOption = question.options.find(
          (opt) => opt.id === selectedOptionId,
        );
        if (!validOption) {
          throw new BadRequestException(
            `Invalid option selected for question ${question.id}`,
          );
        }

        const isCorrect = validOption.isCorrect;
        if (isCorrect) {
          correctAnswersCount++;
        }

        submittedAnswersToInsert.push({
          questionId: question.id,
          selectedOptionId,
          isCorrect,
        });
      }

      const accuracy =
        Math.round((correctAnswersCount / totalQuestions) * 100 * 100) / 100;

      // Create student attempt record
      const attempt = await tx.studentAttempt.create({
        data: {
          assignmentId: assignment.id,
          quizId,
          studentId,
          score: correctAnswersCount,
          totalQuestions,
          accuracy,
          completedAt: new Date(),
        },
      });

      // Insert submitted answers
      await tx.submittedAnswer.createMany({
        data: submittedAnswersToInsert.map((ans) => ({
          attemptId: attempt.id,
          questionId: ans.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect: ans.isCorrect,
        })),
      });

      // Update assignment status to COMPLETED
      await tx.quizAssignment.update({
        where: { id: assignment.id },
        data: { status: AssignmentStatus.COMPLETED },
      });

      return {
        attemptId: attempt.id,
        quizId,
        studentId,
        totalQuestions,
        correctAnswers: correctAnswersCount,
        incorrectAnswers: totalQuestions - correctAnswersCount,
        accuracyPercentage: accuracy,
        quizCompletionStatus: "COMPLETED",
        completedAt: attempt.completedAt,
      };
    });

    // 2. Write-Through Cache: Update Redis Leaderboard immediately after successful commit
    try {
      await this.leaderboardService.recordAttemptScore(
        quizId,
        studentId,
        result.accuracyPercentage,
      );
    } catch (cacheErr: any) {
      this.logger.warn(
        `Redis Write-Through leaderboard update error: ${cacheErr.message}`,
      );
    }

    return result;
  }

  /**
   * Retrieve quiz result breakdown with question review
   */
  async getQuizResult(quizId: string, studentId: string) {
    const attempt = await this.prisma.studentAttempt.findUnique({
      where: {
        quizId_studentId: {
          quizId,
          studentId,
        },
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException(
        "Quiz attempt not found. Quiz has not been submitted yet.",
      );
    }

    return {
      attemptId: attempt.id,
      quizId: attempt.quizId,
      quizTitle: attempt.quiz.title,
      quizDescription: attempt.quiz.description,
      totalQuestions: attempt.totalQuestions,
      correctAnswers: attempt.score,
      incorrectAnswers: attempt.totalQuestions - attempt.score,
      accuracyPercentage: attempt.accuracy,
      quizCompletionStatus: "COMPLETED",
      completedAt: attempt.completedAt,
      review: attempt.answers.map((ans) => ({
        questionId: ans.questionId,
        questionText: ans.question.questionText,
        selectedOptionId: ans.selectedOptionId,
        selectedOptionText: ans.selectedOption.optionText,
        selectedOptionLabel: ans.selectedOption.optionLabel,
        isCorrect: ans.isCorrect,
        correctOption: ans.question.options.find((opt) => opt.isCorrect),
        allOptions: ans.question.options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText,
          optionLabel: opt.optionLabel,
          isCorrect: opt.isCorrect,
        })),
      })),
    };
  }
}
