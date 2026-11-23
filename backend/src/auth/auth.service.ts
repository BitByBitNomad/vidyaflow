import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, DemoLoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('A user with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        name: dto.name,
        role: dto.role || Role.STUDENT,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = this.generateToken(user);

    return {
      user,
      accessToken: token,
      message: 'Registration successful',
    };
  }

  /**
   * Login with email and password
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * One-click demo login for assessor / testing
   */
  async demoLogin(dto: DemoLoginDto) {
    let email = 'teacher@vidyaflow.ai';
    let name = 'Dr. Alan Turing';

    if (dto.role === Role.STUDENT) {
      const idx = dto.studentIndex || '1';
      email = `student${idx}@vidyaflow.ai`;
      name = `Student ${idx}`;
    }

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Auto-create demo user if seed hasn't run yet
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('Password123!', salt);
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role: dto.role,
          passwordHash,
        },
      });
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  /**
   * Returns current user profile
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    return user;
  }

  private generateToken(user: { id: string; email: string; name: string; role: Role }) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const secret =
      this.configService.get<string>('JWT_SECRET') ||
      'vidyaflow_production_grade_jwt_secret_key_super_secure_2026';

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });
  }
}
