import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Role } from '@prisma/client';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  correctAnswers: number;
  totalQuestions: number;
  accuracyPercentage: number;
  completedAt: Date;
  isCurrentUser: boolean;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Write-Through: Update Redis sorted set with student's accuracy score
   */
  async recordAttemptScore(quizId: string, studentId: string, accuracy: number) {
    const redisKey = `leaderboard:${quizId}`;
    await this.redisService.zadd(redisKey, accuracy, studentId);
  }

  /**
   * Get Leaderboard for a specific quiz
   * Authorization: Only accessible to students assigned to that quiz and authorized teachers
   * Leaderboard Rules:
   * 1. Highest accuracy first
   * 2. Only completed attempts appear
   * 3. Equal accuracy receives equal rank (Dense Ranking)
   * 4. Current user entry is clearly flagged
   */
  async getQuizLeaderboard(
    quizId: string,
    currentUserId: string,
    currentUserRole: Role,
  ) {
    // 1. Verify quiz exists
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        teacher: {
          select: { id: true, name: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found.`);
    }

    // 2. Authorization check
    if (currentUserRole === Role.STUDENT) {
      const assignment = await this.prisma.quizAssignment.findUnique({
        where: {
          quizId_studentId: {
            quizId,
            studentId: currentUserId,
          },
        },
      });

      if (!assignment) {
        throw new ForbiddenException(
          'Rejection: Leaderboards are only accessible to students assigned to that quiz and authorized teachers.',
        );
      }
    } else if (currentUserRole === Role.TEACHER) {
      if (quiz.teacherId !== currentUserId) {
        throw new ForbiddenException(
          'Rejection: You are not authorized to view this quiz leaderboard.',
        );
      }
    }

    // 3. Query completed attempts with PostgreSQL DENSE_RANK() for 100% mathematical accuracy on ties
    const rawEntries: any[] = await this.prisma.$queryRaw`
      SELECT 
        sa."id" as "attemptId",
        sa."student_id" as "studentId",
        u."name" as "studentName",
        sa."score" as "correctAnswers",
        sa."total_questions" as "totalQuestions",
        sa."accuracy" as "accuracyPercentage",
        sa."completed_at" as "completedAt",
        DENSE_RANK() OVER (ORDER BY sa."accuracy" DESC) as "denseRank"
      FROM "student_attempts" sa
      JOIN "users" u ON sa."student_id" = u."id"
      WHERE sa."quiz_id" = ${quizId}
      ORDER BY "denseRank" ASC, sa."completed_at" ASC;
    `;

    let myRank: number | null = null;
    let myEntry: LeaderboardEntry | null = null;

    const entries: LeaderboardEntry[] = rawEntries.map((row) => {
      const rank = Number(row.denseRank);
      const isCurrentUser = row.studentId === currentUserId;

      const entry: LeaderboardEntry = {
        rank,
        studentId: row.studentId,
        studentName: row.studentName,
        correctAnswers: Number(row.correctAnswers),
        totalQuestions: Number(row.totalQuestions),
        accuracyPercentage: Number(row.accuracyPercentage),
        completedAt: row.completedAt,
        isCurrentUser,
      };

      if (isCurrentUser) {
        myRank = rank;
        myEntry = entry;
      }

      return entry;
    });

    // Populate Redis sorted set cache in background to keep cache hot
    for (const item of entries) {
      this.recordAttemptScore(quizId, item.studentId, item.accuracyPercentage).catch(() => {});
    }

    return {
      quizId,
      quizTitle: quiz.title,
      totalParticipants: entries.length,
      myRank,
      myEntry,
      leaderboard: entries,
    };
  }
}
