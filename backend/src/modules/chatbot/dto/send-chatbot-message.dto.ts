import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ChatbotHistoryMessageDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MinLength(1)
  @MaxLength(1200)
  content: string;
}

export class ChatbotPageContextDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  path?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2500)
  text?: string;
}

export class SendChatbotMessageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(800)
  message: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ChatbotHistoryMessageDto)
  history?: ChatbotHistoryMessageDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ChatbotPageContextDto)
  page?: ChatbotPageContextDto;

  @IsOptional()
  @IsIn(['en', 'kk', 'ru'])
  language?: 'en' | 'kk' | 'ru';
}
