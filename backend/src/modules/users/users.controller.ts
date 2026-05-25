import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AvatarUploadFile, PublicProfile, UsersService } from './users.service';

const maxAvatarUploadBytes = 700 * 1024;

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Req() request: AuthenticatedRequest): Promise<PublicProfile> {
    return this.usersService.getMe(request.user!.sub);
  }

  @Patch('me')
  updateMe(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<PublicProfile> {
    return this.usersService.updateMe(request.user!.sub, dto);
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('avatar', { limits: { fileSize: maxAvatarUploadBytes } }))
  updateAvatar(
    @Req() request: AuthenticatedRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: maxAvatarUploadBytes })],
      }),
    )
    avatar: AvatarUploadFile,
  ): Promise<PublicProfile> {
    return this.usersService.updateAvatar(request.user!.sub, avatar);
  }
}
