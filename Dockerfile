# 1. Используем официальный Node.js образ для сборки
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходники
COPY . .

# Сборка проекта
RUN npm run build

# 2. Минимальный runtime контейнер
FROM node:20-alpine AS runner

# Рабочая директория для runtime
WORKDIR /app

# Копируем только необходимые файлы из сборки standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Порт приложения
EXPOSE 3000

# Запуск
CMD ["node", "server.js"]


