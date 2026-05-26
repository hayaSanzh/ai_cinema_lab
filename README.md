# AI Cinema Lab

Проект разделен на фронтенд, NestJS backend, документы и архив шаблонных страниц.

```text
frontend/
  public/          # статический сайт, который можно раздавать сервером
  src/             # исходники, partials, SCSS и будущие frontend-данные
frontend-react/
  src/             # новый React/Vite фронт, куда страницы переносятся поэтапно
backend/
  src/             # API, модули, конфиг и работа с БД
  tests/           # тесты backend
docs/              # документы проекта
archive/           # неактивные страницы исходного HTML-шаблона
```

## Frontend

Стартовая страница теперь находится в `frontend/public/index.html`.

Для локального запуска:

```bash
python3 -m http.server 8000 --directory frontend/public
```

После этого сайт будет доступен по адресу `http://localhost:8000`.

Общий frontend chrome находится в `frontend/public/assets/js/pages/layout.js`.
Там собраны header, offcanvas, footer, ссылки соцсетей и mount-point для будущего chatbot, поэтому их не нужно копировать по HTML-страницам.

Production-сборка текущего статического фронта:

```bash
cd frontend
npm install --include=dev
npm run build
```

Результат будет в `frontend/dist`: HTML-картинки конвертируются в WebP, добавляется lazy loading/async decoding, создаются gzip-версии текстовых ассетов.
Nginx config для cache headers и gzip static лежит в `deploy/nginx/frontend-static.conf`.

## React Frontend

Новый фронт находится в `frontend-react/`. Он уже содержит Vite + React + TypeScript,
общий layout, auth-state bridge, language switcher, React chatbot-компонент и перенесенные
страницы `index/about/cases`, auth flow, profile, quiz/result и documentary.

Для локального запуска:

```bash
cd frontend-react
npm install
npm run dev
```

После этого React-версия будет доступна по адресу `http://localhost:5173`.
Старый статический фронт остается рабочим fallback на `http://localhost:8000`.

## Backend

Backend работает на NestJS и PostgreSQL через Prisma.

Основные модули:

- `auth` — регистрация, логин, сессии/JWT, reset password.
- `users` — профили пользователей и аватар.
- `quiz` — вопросы, backend-подсчет результата, сохранение попыток прохождения.

## Docker Compose

Compose поднимает три сервиса:

- `frontend` — Nginx со статической production-сборкой `frontend/dist`;
- `backend` — NestJS API;
- `postgres` — PostgreSQL 16.

Uploads хранятся в volume `aiforge-uploads`, база — в `aiforge-postgres-data`.

Перед запуском убедись, что секреты лежат в `backend/.env` или в переменных окружения сервера.
Файл `backend/.env` не коммитится.

```bash
docker compose up -d --build
```

Локальные адреса по умолчанию:

- frontend: `http://localhost:8080`
- backend: `http://localhost:3000`
- postgres: `localhost:55432`

Остановить:

```bash
docker compose down
```
