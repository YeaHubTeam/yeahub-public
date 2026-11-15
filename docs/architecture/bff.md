# API и BFF: текущее состояние

Документ сверён с кодом после BFF-REFACTOR-05. Источник истины для типов и поведения — связанные исходники. Миграция transport частичная: ниже отдельно перечислены переведённые и legacy-модули. Новых бизнес-контрактов этот документ не вводит.

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
  src/auth.ts: currentBackendSession + композиция
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

Не каждый запрос проходит session boundary. Settings catalog и feature flags публичны; credentials им не нужны. У ряда ещё не переведённых модулей HTTP-механика пока локальная.

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

[Текущая композиция находится в src/auth.ts](../../src/auth.ts). `currentBackendSession()` приватна: читает Auth.js cookie, проверяет backendSession, соответствие subject/userId, JWT expiry, access expiry и абсолютный session deadline. Request Authorization не принимается вместо cookie-сессии.

`getOwnProfile()`, `getHeaderProfile()`, `getSettingsSnapshot()` и другие server helpers вызывают boundary, затем доменный loader с доверенными credentials. `getSettingsSnapshot()` не перемещён в entity: HTTP выполняет `readSettingsSnapshot()`.

Рабочий пример из `src/auth.ts` (в контексте этого модуля, где boundary приватна):

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

## Что ещё не переведено

| Группа                    | Текущий механизм / источник                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public browser/server API | [httpClient/apiFetch](../../src/shared/api/httpClient.ts), [browser hooks](../../src/shared/api/useFetchData.ts), [lazy hook](../../src/shared/api/useLazyFetchData.ts), например [getSubscriptions](../../src/entities/subscription/api/getSubscriptions.ts)                                                                                                                                         |
| Анонимные auth Actions    | [register](<../../src/app/[locale]/(auth)/auth/register/actions.ts>), [forgot-password](<../../src/app/[locale]/(auth)/auth/forgot-password/actions.ts>), [password-recovery](<../../src/app/[locale]/(auth)/auth/password-recovery/actions.ts>): локальный fetch/timeout                                                                                                                             |
| Profile mutations         | [profileManagement](../../src/entities/profile/api/profileManagement.server.ts), [profileEdit](../../src/entities/profile/api/profileEdit.server.ts), [telegram](../../src/entities/profile/api/telegram.server.ts), [verificationEmail](../../src/entities/profile/api/verificationEmail.server.ts), [accountDeletion](../../src/entities/profile/api/accountDeletion.server.ts): локальная механика |
| Subscription mutations    | [trial](../../src/entities/subscription/api/trial.server.ts), [paymentInit](../../src/entities/subscription/api/paymentInit.server.ts), [cancelSubscription](../../src/entities/subscription/api/cancelSubscription.server.ts): отдельные bounded transports                                                                                                                                          |
| Auth.js и avatar          | [backendAuth](../../src/entities/auth/api/backendAuth.server.ts), [auth.ts](../../src/auth.ts), [authRefresh](../../src/lib/authRefresh.server.ts)                                                                                                                                                                                                                                                    |

`apiFetch` не server-only: origin берётся при импорте из public environment с fallback, cache по умолчанию force-cache, response всегда JSON с TS assertion, нет собственного timeout/allowlist. Non-ok выбрасывает Error. Это отличается от backendHttp; не подменять один другим через клиентский entrypoint.

## FSD public API

- Внешний BFF transport import — `@/shared/api/index.server`, не внутренний файл реализации. Внешний config import — `@/shared/config/index.server`.
- [shared/api/index.ts](../../src/shared/api/index.ts) остаётся browser-safe; server-only exports туда не добавляются.
- Доменные server exports идут через подходящий существующий entrypoint, например [subscription/index.server](../../src/entities/subscription/index.server.ts) или [payment/index.server](../../src/entities/payment/index.server.ts). Новый entrypoint/экспорт включать в allowlist задачи.
- Клиентам нужны безопасные domain types через `export type`/`import type`, например [profile/index.ts](../../src/entities/profile/index.ts). Они не должны получать runtime server dependencies.
- [profile/index.server](../../src/entities/profile/index.server.ts) сейчас экспортирует типы для Settings Actions; [profile/server.ts](../../src/entities/profile/server.ts) и [auth/server.ts](../../src/entities/auth/server.ts) сохраняются как существующие legacy server entrypoints. Их массовое переименование не часть добавления endpoint.
- Shared transport не импортирует auth.ts, entities, features, widgets или app. Domain API не импортирует app Actions: app передаёт Actions в widgets через props.

## Не принятые решения и известные пробелы

- Полный перевод legacy API, mutations и Auth.js transport не выполнен и не разрешается этим документом.
- Дополнительные HTTP/error helpers, общий domain-aware client, Cookie support, FormData и внешний AbortSignal пока не приняты. Не добавлять их на вырост.
- `auth.ts` всё ещё содержит Auth.js, session boundary и доменную композицию; разделение возможно отдельной задачей, без второго механизма авторизации.
- Дедупликация read-only Header/page запросов не внедрена. Не распространять потенциальный request-scope cache на mutation readback.
- Общая тестовая конфигурация требует отдельного исправления: см. [ограничения Jest](api-guidelines.md#тестовое-окружение).
- [README](../../README.md) пока является шаблоном create-next-app и не описывает BFF. Рабочие архитектурные правила находятся здесь; README не обновлён в рамках ограниченного documentation scope.
