import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';

const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as JwtSignOptions['expiresIn'];

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-only-change-me',
      signOptions: {
        expiresIn: jwtExpiresIn,
      },
    }),
  ],
  controllers: [QuizController],
  providers: [QuizService, OptionalJwtAuthGuard],
})
export class QuizModule {}
