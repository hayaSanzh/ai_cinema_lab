import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { buildAvatarUrl } from '../../common/avatar-url';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostCommentDto } from './dto/create-post-comment.dto';

type PostViewer = {
  userId?: string;
  anonymousId?: string;
};

type PostCommentResponse = {
  id: string;
  body: string;
  rating: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

type PostDetailsResponse = {
  id: string;
  slug: string;
  title: string;
  youtubeUrl: string;
  description: string | null;
  likeCount: number;
  commentCount: number;
  viewerHasLiked: boolean;
  comments: PostCommentResponse[];
};

type LikeToggleResponse = {
  liked: boolean;
  likeCount: number;
};

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPost(slug: string, viewer: PostViewer): Promise<PostDetailsResponse> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        comments: {
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    const [likeCount, viewerHasLiked] = await Promise.all([
      this.prisma.postLike.count({
        where: { postId: post.id },
      }),
      this.hasViewerLiked(post.id, viewer),
    ]);

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      youtubeUrl: post.youtubeUrl,
      description: post.description,
      likeCount,
      commentCount: post.comments.length,
      viewerHasLiked,
      comments: post.comments.map((comment) => this.toCommentResponse(comment)),
    };
  }

  async toggleLike(slug: string, viewer: PostViewer): Promise<LikeToggleResponse> {
    const post = await this.findPostBySlug(slug);

    if (!viewer.userId && !viewer.anonymousId) {
      throw new BadRequestException('Anonymous id is required for guest likes.');
    }

    if (viewer.userId) {
      return this.toggleUserLike(post.id, viewer);
    }

    return this.toggleAnonymousLike(post.id, viewer.anonymousId!);
  }

  private async toggleUserLike(postId: string, viewer: PostViewer): Promise<LikeToggleResponse> {
    const existingLike = await this.prisma.postLike.findFirst({
      where: {
        postId,
        userId: viewer.userId,
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      return {
        liked: false,
        likeCount: await this.prisma.postLike.count({ where: { postId } }),
      };
    }

    if (viewer.anonymousId) {
      const existingAnonymousLike = await this.prisma.postLike.findFirst({
        where: {
          postId,
          anonymousId: viewer.anonymousId,
        },
      });

      if (existingAnonymousLike) {
        await this.prisma.postLike.delete({
          where: { id: existingAnonymousLike.id },
        });

        return {
          liked: false,
          likeCount: await this.prisma.postLike.count({ where: { postId } }),
        };
      }
    }

    await this.prisma.postLike.create({
      data: {
        postId,
        userId: viewer.userId,
        anonymousId: null,
      },
    });

    return {
      liked: true,
      likeCount: await this.prisma.postLike.count({ where: { postId } }),
    };
  }

  private async toggleAnonymousLike(
    postId: string,
    anonymousId: string,
  ): Promise<LikeToggleResponse> {
    const existingLike = await this.prisma.postLike.findFirst({
      where: {
        postId,
        anonymousId,
      },
    });

    if (existingLike) {
      await this.prisma.postLike.delete({
        where: { id: existingLike.id },
      });

      return {
        liked: false,
        likeCount: await this.prisma.postLike.count({ where: { postId } }),
      };
    }

    await this.prisma.postLike.create({
      data: {
        postId,
        anonymousId,
      },
    });

    return {
      liked: true,
      likeCount: await this.prisma.postLike.count({ where: { postId } }),
    };
  }

  async createComment(
    slug: string,
    userId: string,
    dto: CreatePostCommentDto,
  ): Promise<PostCommentResponse> {
    const post = await this.findPostBySlug(slug);
    const comment = await this.prisma.postComment.create({
      data: {
        postId: post.id,
        userId,
        body: dto.body,
        rating: dto.rating,
      },
      include: {
        user: true,
      },
    });

    return this.toCommentResponse(comment);
  }

  private async findPostBySlug(slug: string): Promise<{ id: string }> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('Post was not found.');
    }

    return post;
  }

  private async hasViewerLiked(postId: string, viewer: PostViewer): Promise<boolean> {
    if (!viewer.userId && !viewer.anonymousId) {
      return false;
    }

    return Boolean(
      await this.prisma.postLike.findFirst({
        where: {
          postId,
          OR: [
            ...(viewer.userId ? [{ userId: viewer.userId }] : []),
            ...(viewer.anonymousId ? [{ anonymousId: viewer.anonymousId }] : []),
          ],
        },
        select: { id: true },
      }),
    );
  }

  private toCommentResponse(comment: {
    id: string;
    body: string;
    rating: number;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      avatarPath: string | null;
    };
  }): PostCommentResponse {
    return {
      id: comment.id,
      body: comment.body,
      rating: comment.rating,
      createdAt: comment.createdAt.toISOString(),
      author: {
        id: comment.user.id,
        name: comment.user.name,
        avatarUrl: buildAvatarUrl(comment.user.avatarPath),
      },
    };
  }
}
