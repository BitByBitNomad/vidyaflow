import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignQuizDto } from './dto/assign-quiz.dto';
import { AssignmentStatus, Role } from '@prisma/client';

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Assign a quiz to one or more students (Teacher only, must own quiz)
   */
  async assignQuiz(teacherId: string, dto: AssignQuizDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
    });

    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${dto.quizId} not found.`);
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You can only assign quizzes that you created.');
    }

    // Verify all selected users are actually students
    const students = await this.prisma.user.findMany({
      where: {
        id: { in: dto.studentIds },
        role: Role.STUDENT,
      },
    });

    if (students.length === 0) {
      throw new BadRequestException('No valid students found in selection.');
    }

    const assigned: string[] = [];
    const alreadyAssigned: string[] = [];

    for (const student of students) {
      const existing = await this.prisma.quizAssignment.findUnique({
        where: {
          quizId_studentId: {
            quizId: dto.quizId,
            studentId: student.id,
          },
        },
      });

      if (existing) {
        alreadyAssigned.push(student.name);
      } else {
        await this.prisma.quizAssignment.create({
          data: {
            quizId: dto.quizId,
            studentId: student.id,
            assignedById: teacherId,
            status: AssignmentStatus.PENDING,
          },
        });
        assigned.push(student.name);
      }
    }

    return {
      message: `Quiz assigned successfully to ${assigned.length} student(s).`,
      assignedCount: assigned.length,
      assignedStudents: assigned,
      alreadyAssignedCount: alreadyAssigned.length,
      alreadyAssignedStudents: alreadyAssigned,
    };
  }

  /**
   * Get all quizzes assigned to a student (Student dashboard)
   */
  async getStudentAssignments(studentId: string) {
    const assignments = await this.prisma.quizAssignment.findMany({
      where: { studentId },
      include: {
        quiz: {
          include: {
            teacher: {
              select: { name: true, email: true },
            },
            _count: {
              select: { questions: true },
            },
          },
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
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      quizId: a.quiz.id,
      title: a.quiz.title,
      description: a.quiz.description,
      teacherName: a.quiz.teacher.name,
      totalQuestions: a.quiz._count.questions,
      status: a.status,
      assignedAt: a.assignedAt,
      attempt: a.attempt,
    }));
  }

  /**
   * Get completion status of students for a specific quiz (Teacher view)
   */
  async getQuizAssignmentStatus(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found.');
    }

    if (quiz.teacherId !== teacherId) {
      throw new ForbiddenException('You do not have access to this quiz.');
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
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((a) => ({
      assignmentId: a.id,
      studentId: a.student.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      status: a.status,
      assignedAt: a.assignedAt,
      score: a.attempt ? a.attempt.score : null,
      totalQuestions: a.attempt ? a.attempt.totalQuestions : null,
      accuracy: a.attempt ? a.attempt.accuracy : null,
      completedAt: a.attempt ? a.attempt.completedAt : null,
    }));
  }
}
