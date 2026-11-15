# API и BFF: текущее состояние

Документ сверён после BFF-AUTH-ARCHITECTURE-06. BFF reads и mutations используют backendHttp; Auth.js lifecycle transport и публичный apiFetch остаются отдельными механизмами. Источник истины для контрактов — связанные исходники. Новых бизнес-правил этот документ не вводит.

- [Практическое руководство](api-guidelines.md)
- [Инструкции разработчикам и агентам](../../AGENTS.md)
- [Общие правила workspace](../../../yeahub-dev-guide/AGENTS.md)
- [Проектные правила public](../../../yeahub-dev-guide/projects/yeahub-public/AGENTS.md)

## Миграция React → Next.js

`yeahub-platform` задаёт согласованное пользовательское поведение: тексты, порядок действий, navigation, loading/error/success. `yeahub-backend` задаёт фактические endpoints, DTO, HTTP status и побочные эффекты. Контроллеры и DTO важнее предположений по React; спорные различия сначала согласуются.

Next.js добавляет серверную boundary: backend Bearer и refresh credentials не передаются в browser props/session. React parity не означает перенос хранения access token в localStorage или автоматического refresh/replay из React HTTP-клиента.

## Карта зависимостей

```text
Защищённые запросы:
Next.js Server Components / Server Actions
                |
  app/_auth/session.server + app/_bff/<domain>
                |
        Domain API modules
                |
     backendHttp (server-only)
                |
         Yeahub backend

Публичные серверные запросы:
Server composition -> public domain/config loader -> backendHttp -> backend

Существующие публичные browser/server запросы:
Public entities helpers / browser hooks -> apiFetch -> backend

Auth.js lifecycle (отдельный текущий механизм):
Auth.js handler/callbacks/events -> backendAuth transport / refresh coordinator -> backend
```

Не каждый запрос проходит session boundary. Settings catalog и feature flags публичны; credentials им не нужны. Отдельный HTTP-механизм сохраняется только у перечисленных ниже исключений Auth transport и публичного apiFetch.

## Ответственность слоёв

| Слой                | Что делает                                                                                     | Чего не делает                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Server Component    | Загружает данные и передаёт безопасные UI-props                                                | Не запускает trial/payment-init/DELETE при render                              |
| Server Action       | Принимает минимальный input, вызывает use case, выполняет адресную locale-aware revalidation   | Не принимает произвольные credentials, userId или backend URL                  |
| Session boundary    | Проверяет доверенную session/identity/expiry и передаёт credentials серверному коду            | Не экспортирует Bearer/refresh клиенту                                         |
| Domain API/use case | Определяет endpoint, query/body, HTTP statuses, DTO validation, ownership, проекцию и readback | Не делегирует бизнес-успех одному `response.ok`                                |
| `backendHttp`       | Безопасно строит URL/headers, выполняет один bounded fetch и callback decoder                  | Не получает session, не обновляет Auth.js, не делает retry/logout/revalidation |
| UI                  | Показывает domain state и вызывает переданную Action по явному действию                        | Не делает прямые чувствительные backend-запросы                                |

## Session boundary и Auth.js

[Session boundary](../../src/app/_auth/session.server.ts) экспортирует `currentBackendSession()` только для серверной композиции: читает Auth.js cookie, проверяет backendSession, соответствие subject/userId, JWT expiry, access expiry и абсолютный session deadline. Request Authorization не принимается вместо cookie-сессии.

`getOwnProfile()`, `getHeaderProfile()`, `getSettingsSnapshot()` и другие server helpers вызывают boundary, затем доменный loader с доверенными credentials. `getSettingsSnapshot()` не перемещён в entity: HTTP выполняет `readSettingsSnapshot()`.

Рабочий пример из [Settings BFF](../../src/app/_bff/settings/reads.server.ts), в контексте его imports:

```typescript
export const getSettingsSnapshot = async (): Promise<SettingsSnapshotResult> => {
	const session = await currentBackendSession();
	if (session.status !== 'success') return session;
	try {
		return await readSettingsSnapshot(
			{ userId: session.data.userId, accessToken: session.data.accessToken },
			getAuthBackendConfig(),
		);
	} catch {
		return { status: 'error' };
	}
};
```

Auth.js session callback возвращает публичные поля пользователя и `requiresRefresh`, не backend tokens. Writable update/refresh и trusted replacement credentials после смены пароля — отдельная существующая логика. Не передавать токены через клиентский `session.update()`.

См. [backend-auth transport](../../src/entities/auth/api/backendAuth.server.ts), [refresh coordinator](../../src/lib/authRefresh.server.ts), [AuthRefreshProvider](../../src/app/[locale]/_providers/AuthRefreshProvider.tsx), [Auth.js Route Handler](../../src/app/api/auth/[...nextauth]/route.ts). Browser provider обращается к same-origin Auth.js, а не посылает backend Bearer самостоятельно.

Auth transport пока не переведён на `backendHttp`: refresh использует Cookie, ответ login/refresh/change-password содержит Set-Cookie; новый transport не разрешает Cookie в request headers. Не расширять allowlist заголовков и не менять callbacks/JWT/cookies/refresh без отдельного дизайна. Координатор refresh делает process-local single-flight и краткое повторное использование результата; это не general retry денежных запросов.

## Размещение и импорты после декомпозиции

В корне `src/` находится только [proxy.ts](../../src/proxy.ts); он сохраняет locale middleware и www redirect, без добавления Auth.js guard.

| Задача                                                                  | Модуль / public API                                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Один NextAuth runtime, provider, callbacks, JWT encode, logout          | [runtime.server.ts](../../src/app/_auth/runtime.server.ts)                         |
| Route Handler и серверные auth-потребители                              | [app/\_auth/index.server.ts](../../src/app/_auth/index.server.ts)                  |
| Проверка cookie, sub, JWT/access expiry и абсолютного deadline          | [session.server.ts](../../src/app/_auth/session.server.ts)                         |
| Password replacement AsyncLocalStorage и fingerprint                    | [passwordReplacement.server.ts](../../src/app/_auth/passwordReplacement.server.ts) |
| Смена пароля и проверка session writes                                  | [password.server.ts](../../src/app/_auth/password.server.ts)                       |
| Profile reads, verification, management, account deletion, avatar, edit | [profile/index.server.ts](../../src/app/_bff/profile/index.server.ts)              |
| Profile save и trusted username sync через тот же runtime               | [profile/edit.server.ts](../../src/app/_bff/profile/edit.server.ts)                |
| Settings snapshot и flag/profile/catalog composition                    | [settings/index.server.ts](../../src/app/_bff/settings/index.server.ts)            |
| Payment History                                                         | [payment/index.server.ts](../../src/app/_bff/payment/index.server.ts)              |
| Trial, payment-init, cancellation                                       | [subscription/index.server.ts](../../src/app/_bff/subscription/index.server.ts)    |
| Browser-safe ChangePasswordResult                                       | type-only из [entities/auth/index.ts](../../src/entities/auth/index.ts)            |

Граф направлен от Actions/Server Components к app composition, session boundary и entities. Runtime использует entity readers и refresh coordinator, но не импортирует app/\_bff. Password writer и profile sync импортируют один runtime напрямую; public auth entrypoint не экспортирует credentials или внутренний nextAuth объект. Server modules защищены server-only. Не добавлять use server ко всему runtime: Actions остаются явной границей вызова из UI.

Перенесённые тесты: [runtime](../../src/app/_auth/runtime.server.test.ts), [session integration](../../src/app/_auth/session.integration.test.ts). Все прежние 39 + 342 сценария и assertions сохранены; изменились imports и mocks.

## Публичный server-only API транспорта

Внешний импорт: `@/shared/api/index.server`. [Entrypoint](../../src/shared/api/index.server.ts) и [реализация](../../src/shared/api/backendHttp.server.ts) защищены `import 'server-only'`.

Текущие публичные типы:

```typescript
export type BackendHttpResult<T> =
	| { status: 'response'; value: T }
	| { status: 'error'; kind: 'configuration' | 'network' | 'timeout' | 'decode' | 'redirect' };

export type BackendHttpOptions<T> = {
	config: { apiOrigin: string; allowedOrigins: readonly string[] };
	/** Root-relative backend path, including an optional encoded query. */
	path: string;
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	/** GET can be a mutation. This metadata never enables retry or caching. */
	effect: 'read' | 'mutation';
	cache: RequestCache;
	timeoutMs: number;
	/** Only Accept, Content-Type and Authorization are supported. */
	headers?: Readonly<Record<string, string>>;
	body?: string;
	/** Runs inside the request deadline; HTTP statuses belong to the domain. */
	decode: (response: Response) => Promise<T>;
};
```

Сигнатура: `backendHttp<T>(options: BackendHttpOptions<T>): Promise<BackendHttpResult<T>>`.

`status: 'response'` означает, что callback завершился, а не что backend/business action успешна. `value` может содержать доменный отказ. HTTP 200/201/204 и 400/401/403/404/409/429/5xx передаются decoder; redirects 300–399 отклоняются transport до decoder.

| Технический kind | Значение                                                  |
| ---------------- | --------------------------------------------------------- |
| `configuration`  | Input/origin/path/options/headers отклонены до fetch      |
| `network`        | Fetch выбросил исключение до получения Response           |
| `timeout`        | Deadline истёк при ожидании fetch или decoder             |
| `decode`         | Callback выбросил исключение, в том числе при чтении body |
| `redirect`       | Получен HTTP redirect; Location не посещается             |

Результат не содержит исходное исключение, request body, URL, Authorization/Cookie/Set-Cookie. Transport не логирует их. Содержимое успешного `value` контролирует доменный decoder: сам generic `T` не валидирует DTO и не очищает чувствительные поля.

### URL, headers и options

- Config передаёт вызывающий серверный код. [getAuthBackendConfig](../../src/shared/config/authBackend.server.ts) валидирует и нормализует origin; наружный импорт loader — через [config/index.server](../../src/shared/config/index.server.ts). Transport не читает environment при импорте.
- Разрешён root-relative path `/…` с query. Внешние URL, `//host`, fragment, backslash, control/whitespace, traversal, encoded separators и double-encoding в path отклоняются. Query формируется доменом через URLSearchParams, без изменения существующей сериализации.
- `apiOrigin` должен быть canonical origin из allowlist. Transport допускает HTTP/HTTPS; решение о допустимом окружении и локальном HTTP принимает config loader.
- Разрешены только `Accept`, `Content-Type`, `Authorization`, без управляющих символов. Header Authorization передаётся из серверного контекста, не из клиентских аргументов. Нет forwarding browser cookies/headers.
- `body` — строка; GET с body запрещён. JSON serialization, DTO и Content-Type определяет домен. FormData/binary/external signal сейчас не входят в API.
- `method`, `effect`, `cache`, `timeoutMs` обязательны. `effect` — явная метка read/mutation, не автоопределение по GET и не самостоятельный cache guard. Текущие шесть read loaders задают no-store и 5000 мс.
- Всегда `redirect: 'manual'`, `credentials: 'omit'`. `omit` не удаляет явно переданный серверный Bearer.

### Timeout и decoder

Один AbortController и таймер охватывают fetch и `await decode(response)`, затем timer очищается в finally. Поздний fetch-response после abort не запускает decoder. Позднее завершение уже начавшегося decoder не меняет возвращённый timeout. Таймер не прерывает синхронную CPU-работу JavaScript; abort не откатывает backend mutation.

JSON/text/empty выбирает домен. Нельзя автоматически вызывать `.json()` на 204 или на void-response. Нельзя вернуть сырой Response для последующего чтения body вне callback и считать это чтение защищённым deadline. Decoder не должен сам выполнять дополнительные запросы или менять auth state.

Ни retry, ни refresh/replay, ни logout по 401 в transport нет. Это особенно важно для mutating GET и денежных операций.

## Уже переведённые модули

| Реальный модуль                                                                      | Endpoint                                            | Доменная обработка                                                                     |
| ------------------------------------------------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [readSettingsCatalog](../../src/entities/subscription/api/settingsCatalog.server.ts) | GET `/subscriptions`                                | Gate до HTTP; только 200; DTO, duplicates, prices, порядок; timeout reason отдельно    |
| [readPaymentHistory](../../src/entities/payment/api/paymentHistory.server.ts)        | GET `/payments/:userId?page=N&limit=5`              | Trusted identity, page/overflow, dates/status projection; 401/403 раздельно            |
| [readHeaderProfile](../../src/entities/profile/api/headerProfile.server.ts)          | GET `/auth/profile`                                 | Минимальные display fields, identity; active profile не требуется                      |
| [readOwnProfile](../../src/entities/profile/api/profile.server.ts)                   | GET `/auth/profile`                                 | Полный OwnProfile; no-active-profile отдельно; 403 остаётся error                      |
| [readSettingsSnapshot](../../src/entities/profile/api/settings.server.ts)            | GET `/auth/profile`                                 | Роли/профили/подписки/даты и безопасный SettingsSnapshot; active profile не обязателен |
| [readTariffFlag](../../src/shared/config/featureFlags.server.ts)                     | GET `/feature-flags` с clientType/search/page/limit | Missing отличается от unavailable; fail-closed gate не изменён                         |

`readTariffFlag()` действительно переведён: в исходнике есть импорт backendHttp и один вызов с `effect: 'read'`. Это шестой loader, помимо первых пяти миграций.

Разные проекции `/auth/profile` не объединены. Нельзя заменить свежий mutation precheck/readback cached данными Header или snapshot страницы. `getSettingsPageData()` загружает flag, один Settings snapshot и catalog по gate; обычный `getSettingsSnapshot()` не загружает flag/catalog. История платежей не добавлена в snapshot.

В [readSettingsCatalog](../../src/entities/subscription/api/settingsCatalog.server.ts) decoder отдельно ловит malformed JSON как invalid-response; технический timeout мапится в timeout, остальные technical errors — backend. В Header/Own/Settings/History technical errors дают прежний error; у flag — unavailable. Универсального доменного error mapper нет.

## Оставшиеся отдельные механизмы

- [Auth transport](../../src/entities/auth/api/backendAuth.server.ts): login, refresh, logout и password change. Refresh отправляет Cookie; ответы login/refresh/password change несут новые credentials. Это согласованное исключение из backendHttp.
- [Публичный apiFetch](../../src/shared/api/httpClient.ts) и browser hooks: публичные JSON-запросы с отдельной cache policy. Не подменять их server-only API.
- [Refresh coordinator](../../src/lib/authRefresh.server.ts) сохранён на прежнем месте и в единственном экземпляре; его перемещение не входило в эту задачу.
- [Logout](../../src/app/_auth/runtime.server.ts) сохраняет best-effort deadline 3000 мс. [Password change](../../src/app/_auth/password.server.ts) сохраняет 5000 мс, проверку replacement и записанной cookie.
- [Profile deletion readback](../../src/entities/profile/api/profileManagement.server.ts) сохраняет отдельный доменный timeout для различения outcome-unknown и incomplete. Это не повторная HTTP-обвязка.

Anonymous auth Actions, Profile Editing/Management, Telegram, verification email, avatar, account deletion и subscription mutations уже используют backendHttp. Trial и cancellation сохраняют 5000 мс, payment-init — 45000 мс. Эти мутационные GET нельзя вызывать при рендере или автоматически повторять.

`apiFetch` не server-only: origin берётся при импорте из public environment с fallback, cache по умолчанию force-cache, response всегда JSON с TS assertion, нет собственного timeout/allowlist. Non-ok выбрасывает Error. Это отличается от backendHttp; не подменять один другим через клиентский entrypoint.

## FSD public API

- Внешний BFF transport import — `@/shared/api/index.server`, не внутренний файл реализации. Внешний config import — `@/shared/config/index.server`.
- [shared/api/index.ts](../../src/shared/api/index.ts) остаётся browser-safe; server-only exports туда не добавляются.
- Доменные server exports идут через подходящий существующий entrypoint, например [subscription/index.server](../../src/entities/subscription/index.server.ts) или [payment/index.server](../../src/entities/payment/index.server.ts). Новый entrypoint/экспорт включать в allowlist задачи.
- Клиентам нужны безопасные domain types через `export type`/`import type`, например [profile/index.ts](../../src/entities/profile/index.ts). Они не должны получать runtime server dependencies.
- [Profile public API](../../src/entities/profile/index.server.ts) экспортирует loaders, mutations и типы. [Auth public API](../../src/entities/auth/index.server.ts) экспортирует существующий BackendAuthError и transport factory. Старые server.ts остаются внутренними/legacy entrypoints для существующих потребителей; новые app-модули их не обходят.
- Shared transport не импортирует Auth.js runtime, entities, features, widgets или app. Domain API не импортирует app Actions: app передаёт Actions в widgets через props.

## Не принятые решения и известные пробелы

- BFF transport migration завершена для согласованных операций. Отдельная миграция Auth.js transport или публичного apiFetch этим документом не разрешается.
- Дополнительные HTTP/error helpers, общий domain-aware client, Cookie support, FormData и внешний AbortSignal пока не приняты. Не добавлять их на вырост.
- Корневой auth.ts и корневые auth-тесты удалены; постоянных compatibility exports нет. В корне src разрешён только proxy.ts.
- Дедупликация read-only Header/page запросов не внедрена. Не распространять потенциальный request-scope cache на mutation readback.
- Общая тестовая конфигурация требует отдельного исправления: см. [ограничения Jest](api-guidelines.md#тестовое-окружение).
- [README](../../README.md) пока является шаблоном create-next-app и не описывает BFF. Рабочие архитектурные правила находятся здесь; README не обновлён в рамках ограниченного documentation scope.
