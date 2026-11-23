import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get teacher high-level dashboard metrics (Teacher only)
   */
  @Get('overview')
  @Roles(Role.TEACHER)
  async getTeacherOverview(@CurrentUser() user: AuthUser) {
    return this.analyticsService.getTeacherOverview(user.id);
  }

  /**
   * Get specific quiz analytics and student breakdown (Teacher only)
   */
  @Get('quiz/:quizId')
  @Roles(Role.TEACHER)
  async getQuizAnalytics(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.analyticsService.getQuizAnalytics(quizId, user.id);
  }
}
