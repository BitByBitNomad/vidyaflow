import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';

export class AssignQuizDto {
  @IsString()
  @IsNotEmpty({ message: 'Quiz ID is required' })
  quizId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Must select at least one student' })
  @IsString({ each: true })
  studentIds: string[];
}
