import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  name: string;

  @IsEnum(Role, { message: 'Role must be TEACHER or STUDENT' })
  @IsOptional()
  role?: Role = Role.STUDENT;
}

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}

export class DemoLoginDto {
  @IsEnum(Role, { message: 'Role must be TEACHER or STUDENT' })
  role: Role;

  @IsString()
  @IsOptional()
  studentIndex?: string; // Optional: "1", "2", "3" to pick student1, student2, student3
}
