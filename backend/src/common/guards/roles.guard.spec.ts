import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard (Requirement 4)', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  // TEST 4: Rejection when a student attempts a teacher-only operation
  describe('Test 4: Rejection when a student attempts a teacher-only operation', () => {
    it('should reject with ForbiddenException when a STUDENT attempts a TEACHER-only route', () => {
      // Endpoint requires TEACHER role
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              id: 'student-id-1',
              email: 'student@vidyaflow.ai',
              role: Role.STUDENT, // Student role!
            },
          }),
        }),
      } as unknown as ExecutionContext;

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(
        ForbiddenException,
      );
    });

    it('should allow access when user role matches TEACHER requirement', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.TEACHER]);

      const mockExecutionContext = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: {
              id: 'teacher-id-1',
              email: 'teacher@vidyaflow.ai',
              role: Role.TEACHER, // Teacher role
            },
          }),
        }),
      } as unknown as ExecutionContext;

      const result = guard.canActivate(mockExecutionContext);
      expect(result).toBe(true);
    });
  });
});
