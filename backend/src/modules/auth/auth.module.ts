import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordResetMailer } from './password-reset-mailer.service';
import { AUTH_USER_REPOSITORY } from './repositories/auth-user.repository';
import { PrismaAuthUserRepository } from './repositories/prisma-auth-user.repository';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as JwtSignOptions['expiresIn'];

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-change-me',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetMailer,
    PrismaAuthUserRepository,
    {
      provide: AUTH_USER_REPOSITORY,
      useExisting: PrismaAuthUserRepository,
    },
  ],
})
export class AuthModule {}
