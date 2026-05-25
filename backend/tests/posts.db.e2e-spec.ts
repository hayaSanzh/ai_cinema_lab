import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Documentary post with Postgres (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const anonymousId = '11111111-1111-4111-8111-111111111111';
  const registerPayload = {
    name: 'Film Reviewer',
    email: 'reviewer@example.com',
    password: 'StrongPass123',
  };

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

  it('returns the seeded documentary post', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/posts/documentary-film')
      .set('X-AIForge-Anonymous-Id', anonymousId)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        slug: 'documentary-film',
        title: 'Documentary Film',
        youtubeUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
        likeCount: 0,
        commentCount: 0,
        viewerHasLiked: false,
        comments: [],
      }),
    );
  });

  it('allows anonymous users to toggle likes', async () => {
    const likeResponse = await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .send({ anonymousId })
      .expect(201);

    expect(likeResponse.body).toEqual({
      liked: true,
      likeCount: 1,
    });

    await request(app.getHttpServer())
      .get('/api/posts/documentary-film')
      .set('X-AIForge-Anonymous-Id', anonymousId)
      .expect(200)
      .expect(({ body }) => {
        expect(body.viewerHasLiked).toBe(true);
        expect(body.likeCount).toBe(1);
      });

    const unlikeResponse = await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .send({ anonymousId })
      .expect(201);

    expect(unlikeResponse.body).toEqual({
      liked: false,
      likeCount: 0,
    });
  });

  it('allows signed-in users to like and comment', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);
    const token = registerResponse.body.accessToken;

    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .set('Authorization', `Bearer ${token}`)
      .send({ anonymousId })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          liked: true,
          likeCount: 1,
        });
      });

    const commentResponse = await request(app.getHttpServer())
      .post('/api/posts/documentary-film/comments')
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'This documentary connects AI cinema with audience perception very well.',
        rating: 5,
      })
      .expect(201);

    expect(commentResponse.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        body: 'This documentary connects AI cinema with audience perception very well.',
        rating: 5,
        createdAt: expect.any(String),
        author: {
          id: registerResponse.body.user.id,
          name: registerPayload.name,
          avatarUrl: null,
        },
      }),
    );

    await request(app.getHttpServer())
      .get('/api/posts/documentary-film')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.likeCount).toBe(1);
        expect(body.commentCount).toBe(1);
        expect(body.viewerHasLiked).toBe(true);
        expect(body.comments[0]).toEqual(
          expect.objectContaining({
            body: 'This documentary connects AI cinema with audience perception very well.',
            rating: 5,
          }),
        );
      });
  });

  it('keeps the same browser like when an anonymous user signs in', async () => {
    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .send({ anonymousId })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          liked: true,
          likeCount: 1,
        });
      });

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/posts/documentary-film')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .set('X-AIForge-Anonymous-Id', anonymousId)
      .expect(200)
      .expect(({ body }) => {
        expect(body.viewerHasLiked).toBe(true);
        expect(body.likeCount).toBe(1);
      });

    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({ anonymousId })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          liked: false,
          likeCount: 0,
        });
      });

    await expect(prisma.postLike.count()).resolves.toBe(0);
  });

  it('rejects anonymous comments', async () => {
    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/comments')
      .send({
        body: 'Anonymous users should not be allowed to comment.',
        rating: 4,
      })
      .expect(401);
  });

  it('validates post interactions', async () => {
    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/likes')
      .send({})
      .expect(400);

    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/posts/documentary-film/comments')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .send({
        body: 'ok',
        rating: 6,
      })
      .expect(400);
  });
});

async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.user.deleteMany();
}
