import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Quiz with Postgres (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const correctAnswersBySlug = new Map([
    ['scene-1', 'ai'],
    ['scene-2', 'real'],
    ['scene-3', 'real'],
    ['scene-4', 'ai'],
    ['scene-5', 'ai'],
    ['scene-6', 'real'],
    ['scene-7', 'ai'],
    ['scene-8', 'real'],
    ['scene-9', 'real'],
    ['scene-10', 'ai'],
  ]);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('returns public quiz questions without correct answers', async () => {
    const response = await request(app.getHttpServer()).get('/api/quiz/questions').expect(200);

    expect(response.body).toHaveLength(10);
    expect(response.body[0]).toEqual({
      id: expect.any(String),
      slug: 'scene-1',
      title: 'Scene 1',
      mediaType: 'image',
      mediaPath: 'assets/img/quiz/1.jpg',
      sortOrder: 1,
    });
    expect(response.body[0].correctAnswer).toBeUndefined();
  });

  it('saves an anonymous quiz attempt', async () => {
    const questions = await prisma.quizQuestion.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/api/quiz/attempts')
      .send({
        answers: questions.map((question) => ({
          slug: question.slug,
          selectedAnswer: correctAnswersBySlug.get(question.slug),
        })),
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        attemptId: expect.any(String),
        userId: null,
        scorePercent: 100,
        averageScorePercent: 100,
        attemptsCount: 1,
        correctCount: 10,
        totalQuestions: 10,
        createdAt: expect.any(String),
      }),
    );

    const resultResponse = await request(app.getHttpServer())
      .get(`/api/quiz/attempts/${response.body.attemptId}`)
      .expect(200);

    expect(resultResponse.body).toEqual(
      expect.objectContaining({
        attemptId: response.body.attemptId,
        userId: null,
        scorePercent: 100,
        averageScorePercent: 100,
        attemptsCount: 1,
        correctCount: 10,
        totalQuestions: 10,
      }),
    );
    expect(resultResponse.body.answers[0]).toEqual({
      slug: 'scene-1',
      selectedAnswer: 'ai',
      isCorrect: true,
    });

    await expect(
      prisma.quizAttempt.findUnique({
        where: {
          id: response.body.attemptId,
        },
        include: {
          answers: true,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        userId: null,
        scorePercent: 100,
        answers: expect.arrayContaining([
          expect.objectContaining({
            selectedAnswer: expect.any(String),
            isCorrect: true,
          }),
        ]),
      }),
    );
  });

  it('attaches a quiz attempt to the signed-in user', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'Quiz User',
        email: 'quiz@example.com',
        password: 'StrongPass123',
      })
      .expect(201);
    const questions = await prisma.quizQuestion.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });
    const answers = questions.map((question, index) => ({
      slug: question.slug,
      selectedAnswer: index === 0 ? 'real' : correctAnswersBySlug.get(question.slug),
    }));

    const response = await request(app.getHttpServer())
      .post('/api/quiz/attempts')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({ answers })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        userId: registerResponse.body.user.id,
        scorePercent: 90,
        averageScorePercent: 90,
        attemptsCount: 1,
        correctCount: 9,
        totalQuestions: 10,
        createdAt: expect.any(String),
      }),
    );
    await expect(
      prisma.quizAttempt.findUnique({
        where: {
          id: response.body.attemptId,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        userId: registerResponse.body.user.id,
        scorePercent: 90,
      }),
    );
  });

  it('rejects incomplete quiz attempts', async () => {
    await request(app.getHttpServer())
      .post('/api/quiz/attempts')
      .send({
        answers: [
          {
            slug: 'scene-1',
            selectedAnswer: 'ai',
          },
        ],
      })
      .expect(400);
  });

  it('returns the average score across all quiz attempts', async () => {
    const questions = await prisma.quizQuestion.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
    });
    const perfectAnswers = questions.map((question) => ({
      slug: question.slug,
      selectedAnswer: correctAnswersBySlug.get(question.slug),
    }));
    const wrongAnswers = questions.map((question) => ({
      slug: question.slug,
      selectedAnswer: correctAnswersBySlug.get(question.slug) === 'ai' ? 'real' : 'ai',
    }));

    const perfectResponse = await request(app.getHttpServer())
      .post('/api/quiz/attempts')
      .send({ answers: perfectAnswers })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/quiz/attempts')
      .send({ answers: wrongAnswers })
      .expect(201);

    const resultResponse = await request(app.getHttpServer())
      .get(`/api/quiz/attempts/${perfectResponse.body.attemptId}`)
      .expect(200);

    expect(resultResponse.body).toEqual(
      expect.objectContaining({
        scorePercent: 100,
        averageScorePercent: 50,
        attemptsCount: 2,
      }),
    );
  });

  it('does not return a result for a missing attempt', async () => {
    await request(app.getHttpServer())
      .get('/api/quiz/attempts/11111111-1111-4111-8111-111111111111')
      .expect(404);
  });
});

async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.passwordResetToken.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.user.deleteMany();
}
