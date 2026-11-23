import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';

@Controller('leaderboard')
@UseGuards(JwtAuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  /**
   * Get leaderboard for a quiz
   * Accessible by students assigned to the quiz and the teacher who created it
   */
  @Get('quiz/:quizId')
  async getQuizLeaderboard(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leaderboardService.getQuizLeaderboard(quizId, user.id, user.role as any);
  }
}
