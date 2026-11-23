import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionDto {
  @IsString()
  @IsNotEmpty({ message: 'Option text cannot be empty' })
  optionText: string;

  @IsString()
  @IsNotEmpty({ message: 'Option label is required (e.g., A, B, C, D)' })
  optionLabel: string;

  @IsBoolean()
  isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'Question text cannot be empty' })
  questionText: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(4, { message: 'Each question must have exactly 4 options' })
  @ArrayMaxSize(4, { message: 'Each question must have exactly 4 options' })
  @Type(() => CreateOptionDto)
  options: CreateOptionDto[];
}

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'Quiz title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: 'A quiz must contain at least 1 question' })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
