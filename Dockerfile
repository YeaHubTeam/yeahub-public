# === Build stage ===
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем только package.json для кэша
COPY package*.json ./
RUN npm ci

# Копируем исходники
COPY . .

# Аргументы для сборки
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL

ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

# Сборка Next.js
RUN npm run build

# === Runtime stage ===
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3000

# Next.js 15+ стартует через npm start
CMD ["npm", "start"]
