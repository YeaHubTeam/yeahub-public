# Правила работы в yeahub-public

## Перед началом

- Прочитать [общие инструкции workspace](../yeahub-dev-guide/AGENTS.md) и [проектные дополнения](../yeahub-dev-guide/projects/yeahub-public/AGENTS.md). Этот файл дополняет их, не заменяет и не ослабляет. При отсутствии документов или конфликте остановиться и сообщить причину.
- Учитывать [Product Vision](../yeahub-dev-guide/PRODUCT_VISION.md). Перед UI-задачей, включая аудит, прочитать [дизайн-систему public](../yeahub-dev-guide/docs/design-system/projects/yeahub-public.md).
- Проверить ветку, Git-статус и фактические исходники. Существующие изменения принадлежат пользователю: сохранять их, не откатывать и не форматировать посторонние файлы.

## Репозитории и scope

- `yeahub-public` — миграция React-приложения на Next.js App Router. Изменения ограничивать задачей и согласованным allowlist.
- `yeahub-platform` — React reference пользовательского поведения; `yeahub-backend` — источник фактических HTTP-контрактов. В frontend-задачах оба репозитория только читать, если пользователь явно не поручил отдельные изменения.
- Не менять endpoints, бизнес-правила, тексты и маршруты ради транспортного рефакторинга. Не расширять scope без согласования.
- Не читать `.env`, credentials и другую защищённую конфигурацию. Не выполнять реальные backend mutations, trial, payment-init, финансовые операции или DELETE для проверки frontend-кода. Использовать моки.
- Без явного поручения не выполнять commit, push, merge, deploy; не обходить Husky и не запускать инфраструктурные операции.

## Архитектурные границы

- Непосредственно в `src/` допустим только `proxy.ts`. Не возвращать `src/auth.ts`, корневые auth-тесты или временные реэкспорты.
- Auth.js singleton расположен в `app/_auth/runtime.server.ts`, cookie-only session boundary — в `app/_auth/session.server.ts`. Password writer и profile sync используют тот же runtime и единственный password replacement AsyncLocalStorage. Runtime не импортирует BFF orchestration.
- Route Handler импортирует `app/_auth/index.server`; доменные операции — через `app/_bff/{profile,settings,payment,subscription}/index.server`. Клиентские типы, включая ChangePasswordResult, импортировать type-only из browser-safe entity public API. Не экспортировать session credentials через клиентский API.

- Соблюдать FSD: внешние импорты через public API. Клиентский код — через `index.ts`, серверный — через подходящий `index.server.ts` с `import 'server-only'`. Type-only импорты обозначать явно. Существующие legacy entrypoints не копировать как новый стандарт.
- Для новых BFF-запросов использовать [backendHttp public API](src/shared/api/index.server.ts), сохраняя DTO validation, identity/ownership, domain errors и readback в доменных модулях/серверной композиции.
- Не получать session/cookies в HTTP transport и не передавать backend credentials клиенту. Auth.js callbacks, JWT, cookies, refresh и session lifecycle менять только отдельной согласованной задачей.
- Не добавлять автоматические retry/refresh/logout. GET может быть mutation. Timeout не доказывает откат; неопределённый результат не объявлять успехом.
- Не заменять browser-safe `apiFetch` серверным transport через клиентский barrel. Не переносить остальные endpoints автоматически вслед за текущей задачей.

Подробности: [архитектура BFF](docs/architecture/bff.md), [практические правила API](docs/architecture/api-guidelines.md).

## Перед завершением

- Выполнить подходящие scoped TypeScript, ESLint, Prettier, целевые тесты только с моками; Stylelint при изменении CSS. Проверить FSD/Steiger при изменении кода/imports. Для documentation-only задач достаточно Markdown, ссылок и diff.
- Сначала проверить безопасность тестового профиля: [известные ограничения Jest](docs/architecture/api-guidelines.md#тестовое-окружение). Не запускать build или проверки, читающие секреты/обращающиеся к backend, автоматически.
- Не использовать auto-fix как проверку; не отключать правила ради зелёного результата. Команды выбирать по [package.json](package.json) и фактическим конфигам; Steiger запускать однократно без watch.
- Выполнить `git diff --check`, проверить allowlist и новые неотслеживаемые файлы. В отчёте отделить выполненные проверки от непроведённых, указать ограничения и фактический baseline diagnostics.
