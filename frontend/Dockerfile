FROM node:20-alpine AS build

WORKDIR /app/frontend-react

COPY frontend-react/package*.json ./
RUN npm ci --include=dev

COPY frontend-react ./
COPY frontend/public /app/frontend/public
COPY frontend/public/assets ./public/assets
RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/nginx/frontend-static.conf /etc/nginx/conf.d/default.conf
COPY deploy/nginx/aiforge-locations.conf /etc/nginx/includes/aiforge-locations.conf
COPY --from=build /app/frontend-react/dist /usr/share/nginx/html

EXPOSE 80
