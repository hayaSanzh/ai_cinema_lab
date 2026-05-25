import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';
import { TogglePostLikeDto } from './dto/toggle-post-like.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  getPost(@Param('slug') slug: string, @Req() request: AuthenticatedRequest) {
    return this.postsService.getPost(slug, {
      userId: request.user?.sub,
      anonymousId: getAnonymousIdFromRequest(request),
    });
  }

  @Post(':slug/likes')
  @UseGuards(OptionalJwtAuthGuard)
  toggleLike(
    @Param('slug') slug: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: TogglePostLikeDto,
  ) {
    return this.postsService.toggleLike(slug, {
      userId: request.user?.sub,
      anonymousId: dto.anonymousId,
    });
  }

  @Post(':slug/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Param('slug') slug: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreatePostCommentDto,
  ) {
    return this.postsService.createComment(slug, request.user!.sub, dto);
  }
}

function getAnonymousIdFromRequest(request: AuthenticatedRequest): string | undefined {
  const headers = request.headers as Record<string, string | string[] | undefined>;
  const value = headers['x-aiforge-anonymous-id'];

  return Array.isArray(value) ? value[0] : value;
}
