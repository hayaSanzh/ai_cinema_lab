import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponse } from './types/auth-response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('google/start')
  @Redirect()
  googleStart(
    @Query('returnTo') returnTo?: string,
    @Query('rememberMe') rememberMe?: string,
  ): { url: string } {
    try {
      return {
        url: this.authService.buildGoogleOAuthStartUrl({
          returnTo,
          rememberMe: rememberMe === 'true' || rememberMe === '1',
        }),
      };
    } catch (error) {
      return {
        url: this.authService.buildGoogleOAuthErrorUrl(error),
      };
    }
  }

  @Get('google/callback')
  @Redirect()
  async googleCallback(
    @Query('code') code?: string,
    @Query('state') state?: string,
  ): Promise<{ url: string }> {
    return {
      url: await this.authService.loginWithGoogleCallback({ code, state }),
    };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }
}
