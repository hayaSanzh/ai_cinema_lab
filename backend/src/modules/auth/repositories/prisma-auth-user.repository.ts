import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AuthPasswordResetToken,
  AuthRepositoryUser,
  AuthUserRepository,
  CreateAuthUserInput,
  CreatePasswordResetTokenInput,
  ResetPasswordInput,
} from './auth-user.repository';

@Injectable()
export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<AuthRepositoryUser | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async create(input: CreateAuthUserInput): Promise<AuthRepositoryUser> {
    return this.prisma.user.create({
      data: input,
    });
  }

  async deletePendingPasswordResetTokens(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.deleteMany({
      where: {
        userId,
        usedAt: null,
      },
    });
  }

  async createPasswordResetToken(
    input: CreatePasswordResetTokenInput,
  ): Promise<AuthPasswordResetToken> {
    return this.prisma.passwordResetToken.create({
      data: input,
    });
  }

  async findPasswordResetTokenByHash(tokenHash: string): Promise<AuthPasswordResetToken | null> {
    return this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: input.tokenId },
        data: { usedAt: input.usedAt },
      }),
      this.prisma.user.update({
        where: { id: input.userId },
        data: { passwordHash: input.passwordHash },
      }),
    ]);
  }
}
