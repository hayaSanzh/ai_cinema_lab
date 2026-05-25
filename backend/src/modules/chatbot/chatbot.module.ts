import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { GeminiClient } from './gemini.client';

@Module({
  controllers: [ChatbotController],
  providers: [ChatbotService, GeminiClient],
})
export class ChatbotModule {}
