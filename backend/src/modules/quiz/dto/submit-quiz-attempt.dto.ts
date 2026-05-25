import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsString, MaxLength, ValidateNested } from 'class-validator';

export class QuizAttemptAnswerDto {
  @IsString()
  @MaxLength(80)
  slug: string;

  @IsIn(['ai', 'real'])
  selectedAnswer: 'ai' | 'real';
}

export class SubmitQuizAttemptDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizAttemptAnswerDto)
  answers: QuizAttemptAnswerDto[];
}
