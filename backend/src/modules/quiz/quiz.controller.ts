import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthenticatedRequest } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';
import { PublicQuizQuestion, QuizAttemptResult, QuizService } from './quiz.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('questions')
  getQuestions(): Promise<PublicQuizQuestion[]> {
    return this.quizService.getQuestions();
  }

  @Post('attempts')
  @UseGuards(OptionalJwtAuthGuard)
  submitAttempt(
    @Req() request: AuthenticatedRequest,
    @Body() dto: SubmitQuizAttemptDto,
  ): Promise<QuizAttemptResult> {
    return this.quizService.submitAttempt(dto, request.user?.sub);
  }

  @Get('attempts/:attemptId')
  getAttempt(
    @Param('attemptId', new ParseUUIDPipe()) attemptId: string,
  ): Promise<QuizAttemptResult> {
    return this.quizService.getAttempt(attemptId);
  }
}
