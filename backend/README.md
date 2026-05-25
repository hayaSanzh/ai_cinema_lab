# Backend

Это NestJS API с PostgreSQL через Prisma.

```text
src/
  app/             # bootstrap приложения и роутинг
  config/          # env/config
  common/          # общие helper'ы, middleware, ошибки
  db/
    migrations/    # миграции БД
    seeds/         # стартовые данные
  modules/
    auth/
    users/
    quiz/
tests/
```

Рекомендуемый первый API-контур:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/avatar`
- `GET /api/quiz/questions`
- `POST /api/quiz/attempts`
- `GET /api/posts/:slug`
- `POST /api/posts/:slug/likes`
- `POST /api/posts/:slug/comments`
- `POST /api/chatbot/messages`

Quiz questions are seeded through Prisma migration `20260525012500_seed_quiz_questions`.
`GET /api/quiz/questions` returns public question data without `correctAnswer`.
`POST /api/quiz/attempts` calculates the score on the backend and stores the attempt; if a valid Bearer token is sent, the attempt is linked to that user.

Profile avatars are uploaded to `UPLOADS_DIR` through `POST /api/users/me/avatar`.
The database stores only `avatar_path`; public avatar URLs are built from `BACKEND_PUBLIC_URL`.

The documentary page uses one seeded post with slug `documentary-film`.
Guest users can like it with an anonymous browser id; only signed-in users can comment.

Cinema Bot uses Gemini through `POST /api/chatbot/messages`.
The frontend sends the current page text and short chat history; the backend adds project instructions and calls Gemini without exposing the API key to the browser.
Set these env variables before using it:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (default: `gemini-2.5-flash`)

Password reset sends email through SMTP when these env variables are set:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

If SMTP is not configured, the backend logs the reset link to the console for local development.

## Local Database

Backend uses PostgreSQL through Prisma.

```bash
npm run db:up
npm run db:migrate
```

The Docker setup creates two databases:

- `aiforge` for local development.
- `aiforge_test` for DB-backed e2e tests.

Run fast in-memory e2e tests:

```bash
npm test
```

Run DB-backed e2e tests:

```bash
npm run test:e2e:db
```
