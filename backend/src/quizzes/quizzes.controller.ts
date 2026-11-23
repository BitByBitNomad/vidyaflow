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
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  /**
   * Create a new quiz (Teacher only)
   */
  @Post()
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  async createQuiz(
    @CurrentUser() user: AuthUser,
    @Body() createQuizDto: CreateQuizDto,
  ) {
    return this.quizzesService.createQuiz(user.id, createQuizDto);
  }

  /**
   * Get all quizzes created by teacher (Teacher only)
   */
  @Get('teacher')
  @Roles(Role.TEACHER)
  async getTeacherQuizzes(@CurrentUser() user: AuthUser) {
    return this.quizzesService.getTeacherQuizzes(user.id);
  }

  /**
   * Get quiz details with answers (Teacher only)
   */
  @Get('teacher/:id')
  @Roles(Role.TEACHER)
  async getQuizForTeacher(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.quizzesService.getQuizForTeacher(id, user.id);
  }

  /**
   * Get sanitized quiz questions for attempting (Student only, hides correct answers)
   */
  @Get(':id/attempt')
  @Roles(Role.STUDENT)
  async getQuizForStudentAttempt(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.quizzesService.getQuizForStudentAttempt(id, user.id);
  }
}
