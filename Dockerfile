# 1. Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2. Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Копируем всё, что нужно для запуска приложения
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# ВАЖНО: Next.js 15+ запускается через файл app.mjs
CMD ["node", ".next/server/app.mjs"]



