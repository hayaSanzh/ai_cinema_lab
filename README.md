# AI Cinema Lab

Проект разделен на фронтенд, NestJS backend, документы и архив шаблонных страниц.

```text
frontend/
  public/          # статический сайт, который можно раздавать сервером
  src/             # исходники, partials, SCSS и будущие frontend-данные
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

## Backend

Backend работает на NestJS и PostgreSQL через Prisma.

Основные модули:

- `auth` — регистрация, логин, сессии/JWT, reset password.
- `users` — профили пользователей и аватар.
- `quiz` — вопросы, backend-подсчет результата, сохранение попыток прохождения.
