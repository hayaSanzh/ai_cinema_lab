import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
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
const googleOAuthStateMaxAgeMs = 10 * 60 * 1000;

type GoogleOAuthState = {
  nonce: string;
  returnTo: string;
  rememberMe: boolean;
  createdAt: number;
};

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
  email_verified?: boolean | string;
  name?: string;
};

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

  buildGoogleOAuthStartUrl(input: { returnTo?: string; rememberMe?: boolean }): string {
    const config = this.getGoogleOAuthConfig();
    const authorizeUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    authorizeUrl.searchParams.set('client_id', config.clientId);
    authorizeUrl.searchParams.set('redirect_uri', config.redirectUri);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'openid email profile');
    authorizeUrl.searchParams.set('access_type', 'online');
    authorizeUrl.searchParams.set('prompt', 'select_account');
    authorizeUrl.searchParams.set(
      'state',
      this.createGoogleOAuthState({
        returnTo: this.sanitizeReturnTo(input.returnTo),
        rememberMe: Boolean(input.rememberMe),
      }),
    );

    return authorizeUrl.toString();
  }

  buildGoogleOAuthErrorUrl(error: unknown): string {
    return this.buildGoogleCallbackUrl({
      error: this.getGoogleOAuthErrorMessage(error),
    });
  }

  async loginWithGoogleCallback(input: { code?: string; state?: string }): Promise<string> {
    try {
      if (!input.code) {
        throw new BadRequestException('Google authorization code is missing.');
      }

      const state = this.parseGoogleOAuthState(input.state);
      const googleUser = await this.fetchGoogleUser(input.code);
      const user = await this.findOrCreateGoogleUser(googleUser);
      const authResponse = await this.createAuthResponse(user, state.rememberMe);

      return this.buildGoogleCallbackUrl({
        accessToken: authResponse.accessToken,
        user: Buffer.from(JSON.stringify(authResponse.user), 'utf8').toString('base64url'),
        rememberMe: state.rememberMe ? '1' : '0',
        returnTo: state.returnTo,
      });
    } catch (error) {
      return this.buildGoogleCallbackUrl({
        error: this.getGoogleOAuthErrorMessage(error),
      });
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async findOrCreateGoogleUser(googleUser: GoogleUserInfo): Promise<AuthRepositoryUser> {
    const email = this.normalizeGoogleEmail(googleUser);
    const existingUser = await this.users.findByEmail(email);

    if (existingUser) {
      return existingUser;
    }

    return this.users.create({
      name: this.normalizeGoogleName(googleUser, email),
      email,
      passwordHash: await bcrypt.hash(randomBytes(32).toString('hex'), 10),
    });
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

  private getGoogleOAuthConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google sign-in is not configured.');
    }

    return {
      clientId,
      clientSecret,
      redirectUri:
        process.env.GOOGLE_OAUTH_REDIRECT_URI ??
        `${(process.env.BACKEND_PUBLIC_URL ?? process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '')}/api/auth/google/callback`,
    };
  }

  private createGoogleOAuthState(input: { returnTo: string; rememberMe: boolean }): string {
    const payload = Buffer.from(
      JSON.stringify({
        nonce: randomBytes(16).toString('hex'),
        returnTo: input.returnTo,
        rememberMe: input.rememberMe,
        createdAt: Date.now(),
      } satisfies GoogleOAuthState),
      'utf8',
    ).toString('base64url');
    const signature = this.signGoogleOAuthState(payload);

    return `${payload}.${signature}`;
  }

  private parseGoogleOAuthState(state?: string): GoogleOAuthState {
    if (!state) {
      throw new BadRequestException('Google OAuth state is missing.');
    }

    const [payload, signature] = state.split('.');

    if (!payload || !signature || !this.isGoogleOAuthStateSignatureValid(payload, signature)) {
      throw new BadRequestException('Google OAuth state is invalid.');
    }

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<GoogleOAuthState>;

    if (
      typeof parsed.nonce !== 'string' ||
      typeof parsed.returnTo !== 'string' ||
      typeof parsed.rememberMe !== 'boolean' ||
      typeof parsed.createdAt !== 'number' ||
      Date.now() - parsed.createdAt > googleOAuthStateMaxAgeMs
    ) {
      throw new BadRequestException('Google OAuth state is expired or malformed.');
    }

    return {
      nonce: parsed.nonce,
      returnTo: this.sanitizeReturnTo(parsed.returnTo),
      rememberMe: parsed.rememberMe,
      createdAt: parsed.createdAt,
    };
  }

  private signGoogleOAuthState(payload: string): string {
    return createHmac('sha256', process.env.JWT_SECRET ?? 'dev-only-change-me')
      .update(payload)
      .digest('base64url');
  }

  private isGoogleOAuthStateSignatureValid(payload: string, signature: string): boolean {
    const expectedSignature = this.signGoogleOAuthState(payload);
    const expectedBuffer = Buffer.from(expectedSignature);
    const actualBuffer = Buffer.from(signature);

    return expectedBuffer.length === actualBuffer.length && timingSafeEqual(expectedBuffer, actualBuffer);
  }

  private sanitizeReturnTo(returnTo?: string): string {
    if (
      !returnTo ||
      !returnTo.startsWith('/') ||
      returnTo.startsWith('//') ||
      returnTo.includes('\\') ||
      returnTo.includes('://') ||
      returnTo.length > 200
    ) {
      return '/';
    }

    return returnTo;
  }

  private async fetchGoogleUser(code: string): Promise<GoogleUserInfo> {
    const config = this.getGoogleOAuthConfig();
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });
    const tokenData = (await tokenResponse.json().catch(() => ({}))) as GoogleTokenResponse;

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new UnauthorizedException(tokenData.error_description ?? tokenData.error ?? 'Google authorization failed.');
    }

    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userInfo = (await userInfoResponse.json().catch(() => ({}))) as GoogleUserInfo;

    if (!userInfoResponse.ok) {
      throw new UnauthorizedException('Could not load Google account profile.');
    }

    return userInfo;
  }

  private normalizeGoogleEmail(googleUser: GoogleUserInfo): string {
    const emailVerified = googleUser.email_verified === true || googleUser.email_verified === 'true';

    if (!googleUser.email || !emailVerified) {
      throw new UnauthorizedException('Google account email is not verified.');
    }

    return this.normalizeEmail(googleUser.email);
  }

  private normalizeGoogleName(googleUser: GoogleUserInfo, email: string): string {
    const name = googleUser.name?.trim();

    if (name && name.length >= 2) {
      return name.slice(0, 120);
    }

    return email.split('@')[0].slice(0, 120);
  }

  private buildGoogleCallbackUrl(params: Record<string, string>): string {
    const appUrl = (process.env.APP_URL ?? process.env.FRONTEND_URL ?? 'http://localhost:5173').replace(/\/$/, '');

    return `${appUrl}/auth/google/callback#${new URLSearchParams(params).toString()}`;
  }

  private getGoogleOAuthErrorMessage(error: unknown): string {
    if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
      const response = error.getResponse();

      if (typeof response === 'object' && response && 'message' in response) {
        const message = (response as { message?: unknown }).message;
        return Array.isArray(message) ? message.join(' ') : String(message);
      }

      return error.message;
    }

    return 'Google sign-in failed. Try again.';
  }
}
