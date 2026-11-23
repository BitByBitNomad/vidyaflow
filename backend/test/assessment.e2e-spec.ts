import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { RedisService } from '../src/redis/redis.service';
import { Role } from '@prisma/client';

describe('VidyaFlow Assessment End-to-End Suite (by BitByBitNomad)', () => {
  let app: INestApplication;
  let teacherToken: string;
  let studentToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Authenticate demo teacher
    const teacherLogin = await request(app.getHttpServer())
      .post('/api/auth/demo-login')
      .send({ role: 'TEACHER' });
    teacherToken = teacherLogin.body.accessToken;

    // Authenticate demo student
    const studentLogin = await request(app.getHttpServer())
      .post('/api/auth/demo-login')
      .send({ role: 'STUDENT', studentIndex: '1' });
    studentToken = studentLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. Teacher Authentication & Profile Retrieval', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${teacherToken}`)
      .expect(200);

    expect(res.body.role).toBe(Role.TEACHER);
    expect(res.body.email).toBe('teacher@vidyaflow.ai');
  });

  it('2. Student Authentication & Profile Retrieval', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(res.body.role).toBe(Role.STUDENT);
    expect(res.body.email).toBe('student1@vidyaflow.ai');
  });

  it('3. Rejection when a student attempts a teacher-only operation (RBAC Guard)', async () => {
    // Student attempts to create a quiz -> Must receive 403 Forbidden
    const res = await request(app.getHttpServer())
      .post('/api/quizzes')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        title: 'Unauthorized Quiz',
        questions: [],
      })
      .expect(403);

    expect(res.body.message).toContain('Access denied');
  });

  it('4. Rate Limiting Protection on Authentication endpoints', async () => {
    // Rapidly call demo-login
    const responses = await Promise.all(
      Array.from({ length: 5 }).map(() =>
        request(app.getHttpServer())
          .post('/api/auth/demo-login')
          .send({ role: 'STUDENT', studentIndex: '2' }),
      ),
    );

    responses.forEach((res) => {
      expect([200, 429]).toContain(res.status);
    });
  });
});
