# AI Cinema Lab React Frontend

This is the new Vite + React + TypeScript frontend that is replacing the static HTML pages.

The old static frontend remains in `../frontend/public` and still works as a fallback while the React version is tested.

## Run Locally

```bash
npm install
npm run dev
```

React frontend:

```text
http://localhost:5173
```

Backend API should run separately:

```text
http://localhost:3000/api
```

## Environment

Copy `.env.example` if local values need to change:

```bash
cp .env.example .env
```

Supported variables:

```env
VITE_API_URL=http://localhost:3000/api
VITE_LEGACY_SITE_URL=http://localhost:8000
```

## Structure

```text
src/
  app/             # app shell, providers, routes
  pages/           # route-level pages
  shared/
    api/           # fetch wrapper
    auth/          # auth session bridge
    config/        # env values
    i18n/          # language setup
    types/         # shared TypeScript types
  widgets/
    chatbot/
    language/
    layout/
  styles/
```

Migrated routes:

- `/`
- `/about`
- `/cases`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/profile`
- `/quiz`
- `/result`
- `/documentary`

## Checks

```bash
npm run lint
npm run build
```
