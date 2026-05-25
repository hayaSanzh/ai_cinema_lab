import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitQuizAttemptDto } from './dto/submit-quiz-attempt.dto';

export type PublicQuizQuestion = {
  id: string;
  slug: string;
  title: string;
  mediaType: string;
  mediaPath: string;
  sortOrder: number;
};

export type QuizAttemptResult = {
  attemptId: string;
  userId: string | null;
  scorePercent: number;
  averageScorePercent: number;
  attemptsCount: number;
  correctCount: number;
  totalQuestions: number;
  createdAt: string;
  answers: Array<{
    slug: string;
    selectedAnswer: string;
    isCorrect: boolean;
  }>;
};

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async getQuestions(): Promise<PublicQuizQuestion[]> {
    const questions = await this.prisma.quizQuestion.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return questions.map((question) => ({
      id: question.id,
      slug: question.slug,
      title: question.title,
      mediaType: question.mediaType,
      mediaPath: question.mediaPath,
      sortOrder: question.sortOrder,
    }));
  }

  async submitAttempt(
    dto: SubmitQuizAttemptDto,
    userId?: string,
  ): Promise<QuizAttemptResult> {
    const questions = await this.prisma.quizQuestion.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    if (questions.length === 0) {
      throw new InternalServerErrorException('Quiz questions are not configured.');
    }

    const answersBySlug = new Map(dto.answers.map((answer) => [answer.slug, answer.selectedAnswer]));

    if (answersBySlug.size !== dto.answers.length) {
      throw new BadRequestException('Each quiz question can be answered only once.');
    }

    if (answersBySlug.size !== questions.length) {
      throw new BadRequestException('Please answer every quiz question.');
    }

    const questionIds = new Set(questions.map((question) => question.slug));
    const unknownSlug = dto.answers.find((answer) => !questionIds.has(answer.slug))?.slug;

    if (unknownSlug) {
      throw new BadRequestException(`Unknown quiz question: ${unknownSlug}.`);
    }

    const checkedAnswers = questions.map((question) => {
      const selectedAnswer = answersBySlug.get(question.slug)!;

      return {
        question,
        selectedAnswer,
        isCorrect: selectedAnswer === question.correctAnswer,
      };
    });
    const correctCount = checkedAnswers.filter((answer) => answer.isCorrect).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId: userId ?? null,
        scorePercent,
        answers: {
          create: checkedAnswers.map((answer) => ({
            questionId: answer.question.id,
            selectedAnswer: answer.selectedAnswer,
            isCorrect: answer.isCorrect,
          })),
        },
      },
    });
    const scoreStats = await this.getScoreStats();

    return {
      attemptId: attempt.id,
      userId: userId ?? null,
      scorePercent,
      averageScorePercent: scoreStats.averageScorePercent,
      attemptsCount: scoreStats.attemptsCount,
      correctCount,
      totalQuestions: questions.length,
      createdAt: attempt.createdAt.toISOString(),
      answers: checkedAnswers.map((answer) => ({
        slug: answer.question.slug,
        selectedAnswer: answer.selectedAnswer,
        isCorrect: answer.isCorrect,
      })),
    };
  }

  async getAttempt(attemptId: string): Promise<QuizAttemptResult> {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: {
        id: attemptId,
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('Quiz attempt was not found.');
    }

    const scoreStats = await this.getScoreStats();

    return {
      attemptId: attempt.id,
      userId: attempt.userId,
      scorePercent: attempt.scorePercent,
      averageScorePercent: scoreStats.averageScorePercent,
      attemptsCount: scoreStats.attemptsCount,
      correctCount: attempt.answers.filter((answer) => answer.isCorrect).length,
      totalQuestions: attempt.answers.length,
      createdAt: attempt.createdAt.toISOString(),
      answers: attempt.answers
        .sort((left, right) => left.question.sortOrder - right.question.sortOrder)
        .map((answer) => ({
          slug: answer.question.slug,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
        })),
    };
  }

  private async getScoreStats(): Promise<{ averageScorePercent: number; attemptsCount: number }> {
    const stats = await this.prisma.quizAttempt.aggregate({
      _avg: {
        scorePercent: true,
      },
      _count: {
        _all: true,
      },
    });

    return {
      averageScorePercent: Math.round(stats._avg.scorePercent ?? 0),
      attemptsCount: stats._count._all,
    };
  }
}
