import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreatePostCommentDto {
  @Transform(trimString)
  @IsString()
  @MinLength(3)
  @MaxLength(1200)
  body: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}
