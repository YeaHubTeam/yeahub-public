# Инструкции для yeahub-public

Перед любой работой обязательно прочитай:

- `../yeahub-dev-guide/AGENTS.md` — общие правила;
- `../yeahub-dev-guide/projects/yeahub-public/AGENTS.md` — правила публичного сайта.

Если любой из этих файлов недоступен, не начинай работу и запроси инструкции. Не начинай изменения кода до прочтения обоих файлов. Сохраняй все существующие локальные изменения и соблюдай общие и проектные ограничения.

## Backend integration workflow

Для задачи «backend feature уже существует, реализуй её на frontend»:

1. Не исследуй backend persistence internals по умолчанию. Найди HTTP-контракт через Swagger/OpenAPI, backend controller и request/response DTO.
2. Зафиксируй endpoint, HTTP method, auth requirements, path/query params, request body, response shape и относящиеся к сценарию error/status responses.
3. Перед изменением найди существующий public-site pattern: endpoint helper в `src/entities/*/api`, типы в соответствующем `model/types`, `apiFetch` из `src/shared/api/httpClient.ts` и при необходимости `useFetchData`/`useLazyFetchData` из `src/shared/api`. Проверь существующую обработку ошибок, auth, cache и state, не добавляя параллельный клиент без причины.
4. Переиспользуй generated/shared API types, если они уже есть. Не создавай types из TypeORM Entity.
5. Не читай backend Entity, Repository или Liquibase по умолчанию. Изучай backend internals только если HTTP-контракт недостаточен/неоднозначен, требуется менять/диагностировать backend behavior или пользователь явно запросил end-to-end изменение.
6. Во frontend-only задаче backend не меняй без отдельной необходимости и согласования.

Для любой задачи применяй общий порядок: задача → определить scope → найти source of truth → прочитать минимально необходимый context → расширять исследование по обнаруженным зависимостям → изменить минимальный набор файлов → проверить затронутый contract. Не читай весь repository без причины; точечный поиск по endpoint, символу или импорту допустим.
