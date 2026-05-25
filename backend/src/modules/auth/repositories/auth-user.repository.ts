export type AuthRepositoryUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarPath: string | null;
  createdAt: Date;
};

export type CreateAuthUserInput = {
  name: string;
  email: string;
  passwordHash: string;
};

export type AuthPasswordResetToken = {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

export type CreatePasswordResetTokenInput = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

export type ResetPasswordInput = {
  tokenId: string;
  userId: string;
  passwordHash: string;
  usedAt: Date;
};

export const AUTH_USER_REPOSITORY = Symbol('AUTH_USER_REPOSITORY');

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthRepositoryUser | null>;
  create(input: CreateAuthUserInput): Promise<AuthRepositoryUser>;
  deletePendingPasswordResetTokens(userId: string): Promise<void>;
  createPasswordResetToken(input: CreatePasswordResetTokenInput): Promise<AuthPasswordResetToken>;
  findPasswordResetTokenByHash(tokenHash: string): Promise<AuthPasswordResetToken | null>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}
