import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { PostsModule } from './modules/posts/posts.module';
import { QuizModule } from './modules/quiz/quiz.module';
import { UsersModule } from './modules/users/users.module';
import { HealthController } from './health.controller';

@Module({
  imports: [AuthModule, UsersModule, QuizModule, PostsModule, ChatbotModule],
  controllers: [HealthController],
})
export class AppModule {}
