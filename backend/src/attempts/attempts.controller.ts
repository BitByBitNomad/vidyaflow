import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AttemptsService } from './attempts.service';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('attempts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttemptsController {
  constructor(private readonly attemptsService: AttemptsService) {}

  /**
   * Submit an attempt for an assigned quiz (Student only)
   */
  @Post(':quizId/submit')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  async submitQuizAttempt(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.attemptsService.submitQuizAttempt(quizId, user.id, dto);
  }

  /**
   * Retrieve quiz results after submission (Student view)
   */
  @Get(':quizId/result')
  @Roles(Role.STUDENT)
  async getMyQuizResult(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.attemptsService.getQuizResult(quizId, user.id);
  }

  /**
   * Retrieve quiz result for a specific student (Teacher only)
   */
  @Get(':quizId/result/:studentId')
  @Roles(Role.TEACHER)
  async getStudentQuizResult(
    @Param('quizId') quizId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.attemptsService.getQuizResult(quizId, studentId);
  }
}
