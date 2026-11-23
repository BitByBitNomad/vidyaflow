import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignQuizDto } from './dto/assign-quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  /**
   * Assign a quiz to selected students (Teacher only)
   */
  @Post()
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async assignQuiz(
    @CurrentUser() user: AuthUser,
    @Body() assignQuizDto: AssignQuizDto,
  ) {
    return this.assignmentsService.assignQuiz(user.id, assignQuizDto);
  }

  /**
   * Get all quizzes assigned to current student (Student only)
   */
  @Get('my')
  @Roles(Role.STUDENT)
  async getMyAssignments(@CurrentUser() user: AuthUser) {
    return this.assignmentsService.getStudentAssignments(user.id);
  }

  /**
   * Get list of students and their completion status for a quiz (Teacher only)
   */
  @Get('quiz/:quizId')
  @Roles(Role.TEACHER)
  async getQuizAssignmentStatus(
    @Param('quizId') quizId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.assignmentsService.getQuizAssignmentStatus(quizId, user.id);
  }
}
