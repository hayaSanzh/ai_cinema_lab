import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { GeminiClient } from '../src/modules/chatbot/gemini.client';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Cinema Bot (e2e)', () => {
  let app: INestApplication;
  let geminiGenerate: jest.Mock;
  let originalGeminiApiKey: string | undefined;
  let originalGeminiModel: string | undefined;

  beforeEach(async () => {
    originalGeminiApiKey = process.env.GEMINI_API_KEY;
    originalGeminiModel = process.env.GEMINI_MODEL;
    process.env.GEMINI_API_KEY = 'test-gemini-key';
    process.env.GEMINI_MODEL = 'gemini-test-model';

    geminiGenerate = jest.fn(async () => ({
      candidates: [
        {
          content: {
            parts: [
              {
                text: 'AI Cinema Lab explores how artificial intelligence changes cinema and perception.',
              },
            ],
          },
        },
      ],
    }));

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GeminiClient)
      .useValue({
        generate: geminiGenerate,
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
    restoreEnv('GEMINI_API_KEY', originalGeminiApiKey);
    restoreEnv('GEMINI_MODEL', originalGeminiModel);
  });

  it('sends project-scoped context to Gemini and returns the reply', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/chatbot/messages')
      .send({
        message: 'What is AI Cinema Lab?',
        history: [
          {
            role: 'assistant',
            content: 'Ask me about the project.',
          },
          {
            role: 'user',
            content: 'Tell me about the quiz.',
          },
        ],
        page: {
          title: 'Documentary Film | AI Cinema Lab',
          path: '/documentary.html',
          text: 'Documentary Film Comments Leave a review',
        },
      })
      .expect(201);

    expect(response.body).toEqual({
      message: 'AI Cinema Lab explores how artificial intelligence changes cinema and perception.',
      model: 'gemini-test-model',
    });
    expect(geminiGenerate).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: 'test-gemini-key',
        model: 'gemini-test-model',
      }),
    );

    const payload = geminiGenerate.mock.calls[0][0].payload;
    expect(payload.systemInstruction.parts[0].text).toContain('AI Cinema Lab');
    expect(payload.systemInstruction.parts[0].text).toContain('Documentary Film');
    expect(payload.contents).toEqual([
      {
        role: 'model',
        parts: [{ text: 'Ask me about the project.' }],
      },
      {
        role: 'user',
        parts: [{ text: 'Tell me about the quiz.' }],
      },
      {
        role: 'user',
        parts: [{ text: 'What is AI Cinema Lab?' }],
      },
    ]);
  });

  it('validates message payloads', async () => {
    await request(app.getHttpServer())
      .post('/api/chatbot/messages')
      .send({
        message: '',
        history: [
          {
            role: 'admin',
            content: '',
          },
        ],
      })
      .expect(400);

    expect(geminiGenerate).not.toHaveBeenCalled();
  });

  it('returns a clear error when the Gemini key is missing', async () => {
    delete process.env.GEMINI_API_KEY;

    await request(app.getHttpServer())
      .post('/api/chatbot/messages')
      .send({
        message: 'What can I do on this site?',
      })
      .expect(503)
      .expect(({ body }) => {
        expect(body.message).toBe('Gemini API key is not configured.');
      });

    expect(geminiGenerate).not.toHaveBeenCalled();
  });
});

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
}
