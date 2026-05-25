import { randomUUID } from 'node:crypto';
import {
  AuthPasswordResetToken,
  AuthRepositoryUser,
  AuthUserRepository,
  CreateAuthUserInput,
  CreatePasswordResetTokenInput,
  ResetPasswordInput,
} from './auth-user.repository';

export class InMemoryAuthUserRepository implements AuthUserRepository {
  private readonly usersByEmail = new Map<string, AuthRepositoryUser>();
  private readonly passwordResetTokensByHash = new Map<string, AuthPasswordResetToken>();

  async findByEmail(email: string): Promise<AuthRepositoryUser | null> {
    return this.usersByEmail.get(email) ?? null;
  }

  async create(input: CreateAuthUserInput): Promise<AuthRepositoryUser> {
    const user: AuthRepositoryUser = {
      id: randomUUID(),
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      avatarPath: null,
      createdAt: new Date(),
    };

    this.usersByEmail.set(input.email, user);

    return user;
  }

  async deletePendingPasswordResetTokens(userId: string): Promise<void> {
    for (const [tokenHash, token] of this.passwordResetTokensByHash.entries()) {
      if (token.userId === userId && !token.usedAt) {
        this.passwordResetTokensByHash.delete(tokenHash);
      }
    }
  }

  async createPasswordResetToken(
    input: CreatePasswordResetTokenInput,
  ): Promise<AuthPasswordResetToken> {
    const token: AuthPasswordResetToken = {
      id: randomUUID(),
      tokenHash: input.tokenHash,
      userId: input.userId,
      expiresAt: input.expiresAt,
      usedAt: null,
    };

    this.passwordResetTokensByHash.set(input.tokenHash, token);

    return token;
  }

  async findPasswordResetTokenByHash(tokenHash: string): Promise<AuthPasswordResetToken | null> {
    return this.passwordResetTokensByHash.get(tokenHash) ?? null;
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const token = [...this.passwordResetTokensByHash.values()].find(
      (item) => item.id === input.tokenId,
    );
    const user = [...this.usersByEmail.values()].find((item) => item.id === input.userId);

    if (token) {
      token.usedAt = input.usedAt;
    }

    if (user) {
      user.passwordHash = input.passwordHash;
    }
  }
}
