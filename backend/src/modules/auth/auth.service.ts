import { randomBytes, createHash } from 'node:crypto';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { buildAvatarUrl } from '../../common/avatar-url';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordResetMailer } from './password-reset-mailer.service';
import {
  AUTH_USER_REPOSITORY,
  AuthRepositoryUser,
  AuthUserRepository,
} from './repositories/auth-user.repository';
import { AuthResponse, AuthUser } from './types/auth-response.type';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as JwtSignOptions['expiresIn'];
const jwtRememberExpiresIn = (process.env.JWT_REMEMBER_EXPIRES_IN ?? '30d') as JwtSignOptions['expiresIn'];
const passwordResetTokenTtlMinutes = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? 30);

@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_USER_REPOSITORY)
    private readonly users: AuthUserRepository,
    private readonly jwtService: JwtService,
    private readonly passwordResetMailer: PasswordResetMailer,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);

    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email is already registered.');
    }

    const user = await this.users.create({
      name: dto.name.trim(),
      email,
      passwordHash: await bcrypt.hash(dto.password, 10),
    });

    return this.createAuthResponse(user, dto.rememberMe);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.users.findByEmail(email);
    const message = 'If this email exists, a password reset link has been sent.';

    if (!user) {
      return { message };
    }

    const token = this.createPasswordResetToken();
    const tokenHash = this.hashPasswordResetToken(token);
    const expiresAt = new Date(Date.now() + passwordResetTokenTtlMinutes * 60 * 1000);
    const resetUrl = this.buildPasswordResetUrl(token);

    await this.users.deletePendingPasswordResetTokens(user.id);
    await this.users.createPasswordResetToken({
      tokenHash,
      userId: user.id,
      expiresAt,
    });
    await this.passwordResetMailer.sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      expiresInMinutes: passwordResetTokenTtlMinutes,
    });

    return { message };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenHash = this.hashPasswordResetToken(dto.token);
    const resetToken = await this.users.findPasswordResetTokenByHash(tokenHash);

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Password reset link is invalid or expired.');
    }

    await this.users.resetPassword({
      tokenId: resetToken.id,
      userId: resetToken.userId,
      passwordHash: await bcrypt.hash(dto.password, 10),
      usedAt: new Date(),
    });

    return { message: 'Password has been reset. You can sign in now.' };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return this.createAuthResponse(user, dto.rememberMe);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async createAuthResponse(
    user: AuthRepositoryUser,
    rememberMe = false,
  ): Promise<AuthResponse> {
    return {
      user: this.toPublicUser(user),
      accessToken: await this.createAccessToken(user, rememberMe),
    };
  }

  private toPublicUser(user: AuthRepositoryUser): AuthUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: buildAvatarUrl(user.avatarPath),
      createdAt: user.createdAt.toISOString(),
    };
  }

  private createAccessToken(user: AuthRepositoryUser, rememberMe: boolean): Promise<string> {
    return this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: rememberMe ? jwtRememberExpiresIn : jwtExpiresIn,
      },
    );
  }

  private createPasswordResetToken(): string {
    return randomBytes(32).toString('hex');
  }

  private hashPasswordResetToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private buildPasswordResetUrl(token: string): string {
    const appUrl = process.env.APP_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:8000';

    return `${appUrl.replace(/\/$/, '')}/reset-password.html?token=${encodeURIComponent(token)}`;
  }
}
