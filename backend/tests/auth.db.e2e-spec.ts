import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PasswordResetMailer } from '../src/modules/auth/password-reset-mailer.service';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Auth register/login with Postgres (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let sentResetUrls: string[];

  const registerPayload = {
    name: 'Zhaniya Serikbayeva',
    email: 'Zhaniya@example.com',
    password: 'StrongPass123',
  };

  beforeAll(async () => {
    sentResetUrls = [];

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PasswordResetMailer)
      .useValue({
        sendPasswordResetEmail: jest.fn(async ({ resetUrl }: { resetUrl: string }) => {
          sentResetUrls.push(resetUrl);
        }),
      })
      .compile();

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
    sentResetUrls = [];
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  it('persists a registered user with a hashed password', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    const user = await prisma.user.findUnique({
      where: {
        email: 'zhaniya@example.com',
      },
    });

    expect(user).toEqual(
      expect.objectContaining({
        id: response.body.user.id,
        name: registerPayload.name,
        email: 'zhaniya@example.com',
        avatarPath: null,
      }),
    );
    expect(user?.passwordHash).toEqual(expect.any(String));
    expect(user?.passwordHash).not.toBe(registerPayload.password);
    expect(user?.passwordHash.startsWith('$2')).toBe(true);
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('logs in using the user persisted in Postgres', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'zhaniya@example.com',
        password: registerPayload.password,
      })
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: registerPayload.name,
        email: 'zhaniya@example.com',
        avatarUrl: null,
        createdAt: expect.any(String),
      },
      accessToken: expect.any(String),
    });
    expect(decodeJwtPayload(response.body.accessToken)).toEqual(
      expect.objectContaining({
        sub: response.body.user.id,
        email: 'zhaniya@example.com',
        exp: expect.any(Number),
        iat: expect.any(Number),
      }),
    );
  });

  it('enforces the database unique email constraint through the API', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        ...registerPayload,
        email: 'ZHANIYA@example.com',
      })
      .expect(409);

    await expect(prisma.user.count()).resolves.toBe(1);
  });

  it('stores a hashed reset token and updates the password', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({
        email: 'zhaniya@example.com',
      })
      .expect(200);

    expect(sentResetUrls).toHaveLength(1);
    const token = getResetTokenFromUrl(sentResetUrls[0]);
    const resetToken = await prisma.passwordResetToken.findFirst();

    expect(resetToken).toEqual(
      expect.objectContaining({
        tokenHash: expect.any(String),
        usedAt: null,
      }),
    );
    expect(resetToken?.tokenHash).toHaveLength(64);
    expect(resetToken?.tokenHash).not.toBe(token);

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token,
        password: 'NewStrongPass123',
      })
      .expect(200);

    await expect(
      prisma.passwordResetToken.findUnique({
        where: {
          id: resetToken!.id,
        },
      }),
    ).resolves.toEqual(expect.objectContaining({ usedAt: expect.any(Date) }));

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'zhaniya@example.com',
        password: registerPayload.password,
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'zhaniya@example.com',
        password: 'NewStrongPass123',
      })
      .expect(200);
  });

  it('returns and updates the current user profile', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);
    const token = registerResponse.body.accessToken;
    const avatarImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
      'base64',
    );

    const meResponse = await request(app.getHttpServer())
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meResponse.body).toEqual(
      expect.objectContaining({
        id: registerResponse.body.user.id,
        name: registerPayload.name,
        email: 'zhaniya@example.com',
        avatarUrl: null,
      }),
    );

    const updateResponse = await request(app.getHttpServer())
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Zhaniya',
      })
      .expect(200);

    expect(updateResponse.body).toEqual(
      expect.objectContaining({
        id: registerResponse.body.user.id,
        name: 'Updated Zhaniya',
        email: 'zhaniya@example.com',
        avatarUrl: null,
      }),
    );

    const avatarResponse = await request(app.getHttpServer())
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)
      .attach('avatar', avatarImage, {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(201);

    expect(avatarResponse.body).toEqual(
      expect.objectContaining({
        id: registerResponse.body.user.id,
        name: 'Updated Zhaniya',
        email: 'zhaniya@example.com',
        avatarUrl: expect.stringMatching(/^http:\/\/localhost:3000\/uploads\/avatars\/.+\.png$/),
      }),
    );

    await expect(
      prisma.user.findUnique({
        where: {
          id: registerResponse.body.user.id,
        },
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        name: 'Updated Zhaniya',
        avatarPath: expect.stringMatching(/^\/uploads\/avatars\/.+\.png$/),
      }),
    );
  });

  it('rejects invalid avatar uploads', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/users/me/avatar')
      .set('Authorization', `Bearer ${registerResponse.body.accessToken}`)
      .attach('avatar', Buffer.from('not an image'), {
        filename: 'avatar.png',
        contentType: 'image/png',
      })
      .expect(400);

    await expect(
      prisma.user.findUnique({
        where: {
          id: registerResponse.body.user.id,
        },
      }),
    ).resolves.toEqual(expect.objectContaining({ avatarPath: null }));
  });
});

async function cleanDatabase(prisma: PrismaService): Promise<void> {
  await rm(resolve(process.cwd(), 'uploads-test'), { recursive: true, force: true });
  await prisma.passwordResetToken.deleteMany();
  await prisma.postComment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.user.deleteMany();
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');

  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
}

function getResetTokenFromUrl(resetUrl: string): string {
  const token = new URL(resetUrl).searchParams.get('token');

  if (!token) {
    throw new Error('Reset URL did not contain a token.');
  }

  return token;
}
