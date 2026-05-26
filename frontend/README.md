# Frontend

`public/` — текущая рабочая статическая версия сайта. Все HTML-страницы и runtime-ассеты лежат здесь.

`src/` — место для исходников, которые не должны быть напрямую публичными:

- `src/styles/scss/` — SCSS из исходного шаблона.
- `src/partials/` — будущие общие куски HTML: `head`, `header`, `footer`, `scripts`.
- `src/scripts/` — место для исходников JS, если позже появится сборка.
- `src/data/` — место для данных, которые позже можно будет заменить API/БД.

Сейчас quiz-данные раздаются из `public/assets/data/quiz.json`, потому что runtime-страницы остаются статическими.

## Local Development

```bash
npm run serve
```

Открыть сайт: `http://localhost:8000`.

## Production Build

```bash
npm install --include=dev
npm run build
```

Build пишет результат в `frontend/dist`.

Что делает сборка:

- копирует `public/` в `dist/`;
- конвертирует HTML-картинки `jpg/png` в `webp`, если новый файл меньше оригинала;
- добавляет `width`, `height`, `decoding="async"` и `loading="lazy"` для некритичных изображений;
- добавляет lazy loading для iframe;
- создает `.gz` версии для HTML/CSS/JS/JSON/SVG;
- пишет отчет в `dist/build-report.json`.

Для проверки production-сборки:

```bash
npm run serve:dist
```

Открыть: `http://localhost:8080`.

Nginx cache/compression config лежит в `../deploy/nginx/frontend-static.conf`.
