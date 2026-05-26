# Deploy

Здесь лежат конфиги для production-раздачи проекта.

## Static Frontend

`nginx/frontend-static.conf` ожидает, что production build фронта будет смонтирован в:

```text
/usr/share/nginx/html
```

В Docker Compose этот же Nginx также проксирует:

- `/api/` -> `backend:3000`
- `/uploads/` -> `backend:3000`

Cache policy:

- HTML: `no-cache`, чтобы пользователи быстро получали новые страницы.
- Assets: `Cache-Control: public, max-age=31536000, immutable`.
- Gzip static: Nginx может отдавать заранее созданные `.gz` файлы из `frontend/dist`.

Сборка:

```bash
cd frontend
npm install --include=dev
npm run build
```

## Self-Signed SSL On A Separate Port

Use `docker-compose.ssl.yml` when the host already has another project on `80/443`.

Example sslip.io domain:

```text
aicinema.213.155.21.121.sslip.io
```

Generate a self-signed certificate on the server:

```bash
mkdir -p deploy/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout deploy/certs/aiforge.key \
  -out deploy/certs/aiforge.crt \
  -subj "/CN=aicinema.213.155.21.121.sslip.io" \
  -addext "subjectAltName=DNS:aicinema.213.155.21.121.sslip.io"
```

Run:

```bash
docker compose -f docker-compose.yml -f docker-compose.ssl.yml up -d --build
```

Default HTTPS URL:

```text
https://aicinema.213.155.21.121.sslip.io:8443
```
