import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }

    return user;
  }

  /**
   * List all available students for teacher to assign quizzes
   */
  async findAllStudents() {
    return this.prisma.user.findMany({
      where: { role: Role.STUDENT },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
