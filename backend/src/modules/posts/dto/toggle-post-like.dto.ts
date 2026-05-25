import { IsOptional, IsUUID } from 'class-validator';

export class TogglePostLikeDto {
  @IsOptional()
  @IsUUID()
  anonymousId?: string;
}
