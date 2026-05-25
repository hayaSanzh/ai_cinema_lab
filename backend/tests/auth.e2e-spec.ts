import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PasswordResetMailer } from '../src/modules/auth/password-reset-mailer.service';
import { AUTH_USER_REPOSITORY } from '../src/modules/auth/repositories/auth-user.repository';
import { InMemoryAuthUserRepository } from '../src/modules/auth/repositories/in-memory-auth-user.repository';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Auth register/login (e2e)', () => {
  let app: INestApplication;
  let sentResetUrls: string[];

  const registerPayload = {
    name: 'Ainissa Sarsenbayeva',
    email: 'Ainissa@example.com',
    password: 'StrongPass123',
  };

  beforeEach(async () => {
    sentResetUrls = [];

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AUTH_USER_REPOSITORY)
      .useClass(InMemoryAuthUserRepository)
      .overrideProvider(PasswordResetMailer)
      .useValue({
        sendPasswordResetEmail: jest.fn(async ({ resetUrl }: { resetUrl: string }) => {
          sentResetUrls.push(resetUrl);
        }),
      })
      .overrideProvider(PrismaService)
      .useValue({})
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
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers a new user and returns public user data with an access token', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(registerPayload)
      .expect(201);

    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: registerPayload.name,
        email: 'ainissa@example.com',
        avatarUrl: null,
        createdAt: expect.any(String),
      },
      accessToken: expect.any(String),
    });
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(decodeJwtPayload(response.body.accessToken)).toEqual(
      expect.objectContaining({
        sub: response.body.user.id,
        email: 'ainissa@example.com',
        exp: expect.any(Number),
        iat: expect.any(Number),
      }),
    );
  });

  it('rejects invalid registration payloads', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        name: 'A',
        email: 'not-an-email',
        password: 'short',
        role: 'admin',
      })
      .expect(400);

    expect(response.body.message).toEqual(
      expect.arrayContaining([
        expect.stringContaining('name must be longer than or equal to 2 characters'),
        expect.stringContaining('email must be an email'),
        expect.stringContaining('password must be longer than or equal to 8 characters'),
        expect.stringContaining('property role should not exist'),
      ]),
    );
  });

  it('rejects duplicate registration emails case-insensitively', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        ...registerPayload,
        email: 'AINISSA@example.com',
      })
      .expect(409);
  });

  it('logs in a registered user and returns public user data with an access token', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'ainissa@example.com',
        password: registerPayload.password,
      })
      .expect(200);

    expect(response.body).toEqual({
      user: {
        id: expect.any(String),
        name: registerPayload.name,
        email: 'ainissa@example.com',
        avatarUrl: null,
        createdAt: expect.any(String),
      },
      accessToken: expect.any(String),
    });
    expect(response.body.user.password).toBeUndefined();
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(decodeJwtPayload(response.body.accessToken)).toEqual(
      expect.objectContaining({
        sub: response.body.user.id,
        email: 'ainissa@example.com',
        exp: expect.any(Number),
        iat: expect.any(Number),
      }),
    );
  });

  it('extends the token lifetime when remember me is enabled', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        ...registerPayload,
        email: 'remember@example.com',
        rememberMe: true,
      })
      .expect(201);

    const payload = decodeJwtPayload(response.body.accessToken);

    expect(Number(payload.exp) - Number(payload.iat)).toBeGreaterThan(60 * 60 * 24 * 20);
  });

  it('sends a password reset link and accepts a new password', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({
        email: 'AINISSA@example.com',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('If this email exists, a password reset link has been sent.');
      });

    expect(sentResetUrls).toHaveLength(1);
    const token = getResetTokenFromUrl(sentResetUrls[0]);

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token,
        password: 'NewStrongPass123',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'ainissa@example.com',
        password: registerPayload.password,
      })
      .expect(401);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'ainissa@example.com',
        password: 'NewStrongPass123',
      })
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/auth/reset-password')
      .send({
        token,
        password: 'AnotherStrongPass123',
      })
      .expect(400);
  });

  it('does not reveal whether a forgot-password email exists', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/forgot-password')
      .send({
        email: 'missing@example.com',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.message).toBe('If this email exists, a password reset link has been sent.');
      });

    expect(sentResetUrls).toHaveLength(0);
  });

  it('rejects login with an incorrect password', async () => {
    await request(app.getHttpServer()).post('/api/auth/register').send(registerPayload).expect(201);

    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'ainissa@example.com',
        password: 'WrongPass123',
      })
      .expect(401);
  });

  it('rejects login for an unknown email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'missing@example.com',
        password: 'StrongPass123',
      })
      .expect(401);
  });
});

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
