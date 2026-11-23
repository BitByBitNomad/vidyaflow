import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Question ID is required' })
  questionId: string;

  @IsString()
  @IsNotEmpty({ message: 'Selected option ID is required' })
  selectedOptionId: string;
}

export class SubmitAttemptDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Must submit answers for the quiz' })
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
