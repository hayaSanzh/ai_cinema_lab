import { Body, Controller, Post } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { SendChatbotMessageDto } from './dto/send-chatbot-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('messages')
  sendMessage(@Body() dto: SendChatbotMessageDto) {
    return this.chatbotService.sendMessage(dto);
  }
}
