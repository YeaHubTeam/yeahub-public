# Практические правила API и BFF

Это руководство для новых запросов и согласованных переносов. Оно не разрешает массовый рефакторинг существующих модулей. Сначала прочитать [AGENTS.md](../../AGENTS.md) и [фактическую архитектуру](bff.md).

## До изменения кода

1. Проверить ветку, рабочее дерево, allowlist и ближайший существующий use case. Сохранить пользовательские изменения.
2. Найти React-сценарий и фактический backend controller/DTO: method, URL, query/body, guards/ownership, success status/body, ошибки и побочные эффекты. Не выводить HTTP-контракт из TypeORM Entity или названия GET.
3. Определить публичность запроса, server/browser контекст, источник identity/credentials, требуемую свежесть и число запросов. Установить, действительно ли задача требует нового запроса.
4. Проверить текущие domain result types и UI-проекцию. Согласовать контракт/allowlist до выхода за scope; не менять backend ради frontend-унификации.
5. Не читать environment-файлы и не выполнять реальные backend-запросы для исследования. Sensitive tests — только mocks и фиктивные данные.

## Добавление read-only GET

### Выбор места

- Endpoint/DTO/projection размещать в API-модуле соответствующего entity; брать ближайший существующий пример из [списка мигрированных loaders](bff.md#уже-переведённые-модули).
- Низкоуровневый transport импортировать из `@/shared/api/index.server`. Domain helpers наружу публиковать через server entrypoint, а безопасные UI-types — type-only через public API. Не делать внешний импорт внутренних файлов другого слайса.
- Для protected read переиспользовать существующую композицию с приватной `currentBackendSession()` в [auth.ts](../../src/auth.ts). Не экспортировать универсальный client-accessible getter credentials и не принимать userId/token вместо trusted session.
- Для публичного read credentials не нужны. Config получать через существующий серверный loader. Не читать env при импорте доменного API.

### Явные transport options

Задать `config`, root-relative `path`, `method: 'GET'`, `effect: 'read'`, явные `cache`, `timeoutMs`, необходимые headers и `decode`. У шести мигрированных loaders сейчас no-store/5000; это состояние конкретных операций, не скрытый default transport.

Transport сам принудительно задаёт manual/omit. Не добавлять второй AbortController/race/timer вокруг обычного вызова. Query формируется доменом через URLSearchParams; фиксированные limit и trusted identity не принимать из произвольного client input. Пример: [Payment History](../../src/entities/payment/api/paymentHistory.server.ts) принимает page, но limit всегда5, userId/Bearer приходят из server boundary.

### Status, JSON и DTO

1. В decoder сначала проверить точный HTTP status и вернуть соответствующий **доменный** отказ. 401/403 не означают автоматически logout/refresh.
2. Затем прочитать ожидаемый формат body внутри callback: JSON, text или ничего. Проверять JSON как unknown, а не считать generic `T` runtime validation.
3. Проверить обязательные поля, nullable значения, pagination, duplicates, даты и принадлежность identity там, где это позволяет контракт ответа.
4. Вернуть узкую UI-проекцию. Не передавать полный backend DTO, credentials, permission objects или платёжные реквизиты.
5. Сопоставить technical error с существующим domain union. `response` означает результат decoder; `value.status` всё ещё может быть отказом.

Существующие различия сохранять: OwnProfile требует active profile и возвращает no-active-profile; Header/Settings его не требуют. HTTP403 для OwnProfile — error, для Header/Settings/History — forbidden. Не выносить их в общий decoder.

### Реальный пример публичного GET

Ниже существующая `readTariffFlag()` из [featureFlags.server.ts](../../src/shared/config/featureFlags.server.ts). Это тело функции в контексте исходного модуля: `key`, `object`, `text`, публичные типы и импорт backendHttp объявлены там же. Decoder и маппинг приведены полностью, без пропуска DTO validation.

```typescript
export const readTariffFlag = async (config: PublicBackendConfig): Promise<TariffFlagResult> => {
	const unavailable = { status: 'unavailable' } as const;
	const query = new URLSearchParams({
		clientType: 'WEB',
		search: key,
		page: '1',
		limit: '10',
	});
	const result = await backendHttp<TariffFlagResult>({
		config,
		path: `/feature-flags?${query.toString()}`,
		method: 'GET',
		effect: 'read',
		cache: 'no-store',
		timeoutMs: 5000,
		decode: async (response) => {
			if (response.status !== 200) return unavailable;
			const data: unknown = await response.json();
			if (
				!object(data) ||
				!Array.isArray(data.data) ||
				data.page !== 1 ||
				data.limit !== 10 ||
				!Number.isSafeInteger(data.total) ||
				(data.total as number) < 0 ||
				data.total !== data.data.length ||
				data.data.length > 10
			)
				return unavailable;
			const matches: { enabled: boolean; roles: string[] }[] = [];
			for (const flag of data.data) {
				if (
					!object(flag) ||
					!text(flag.flag) ||
					!['WEB', 'IOS', 'ANDROID'].includes(flag.clientType as string) ||
					typeof flag.enabled !== 'boolean' ||
					!Array.isArray(flag.roles) ||
					!flag.roles.every(text)
				)
					return unavailable;
				if (flag.flag === key && flag.clientType === 'WEB')
					matches.push({ enabled: flag.enabled, roles: flag.roles });
			}
			if (matches.length > 1) return unavailable;
			return matches.length ? { status: 'success', ...matches[0] } : { status: 'missing' };
		},
	});
	return result.status === 'response' ? result.value : unavailable;
};
```

Для protected GET пример boundary-композиции см. [getSettingsSnapshot](bff.md#session-boundary-и-authjs); пример identity validation — [readHeaderProfile](../../src/entities/profile/api/headerProfile.server.ts). Не копировать типы/обязательность полей Header в OwnProfile/Settings.

### Проверка переноса существующего запроса

Сначала сохранить существующие fixtures/assertions. Изменять только transport и необходимую форму HTTP-mock. Например, transport создаёт Headers; проверять точное содержимое Headers, не удалять проверку Authorization. Явный GET эквивалентен прежнему fetch default, но endpoint/query/body/cache и число запросов должны остаться прежними.

Сопоставить результаты до/после для старых fixtures; добавить timeout зависшего body. Не объявлять readback успешным по одному HTTP200 и не добавлять profile request к Payment History. Не менять config normalization, DTO или бизнес-политику ради нового клиента. Если transport API не подходит, остановиться вместо изменения третьего файла без согласования.

## Добавление mutation

Общий transport технически поддерживает строковый body и explicit effect mutation, но существующие mutations ещё не переведены. Новый use case и перенос старого требуют своего согласования. `effect` не устанавливает автоматически no-store: для mutation его необходимо задать явно и проверить тестом.

### 1. Precheck

- Принять только нужный клиентский input, не userId/Bearer/refresh/backend URL. Проверить типы, размер, allowlist полей и domain rules.
- Получить trusted session через существующую boundary. При необходимости проверить access/session deadline повторно после длинного pre-read.
- Свежим серверным чтением проверить identity, ownership, expected profile/subscription и доступность операции. Snapshot страницы не заменяет проверку перед mutation.
- Проверки UI/disabled не авторизация. При ошибке precheck mutation-request должен отсутствовать.

### 2. Один изменяющий запрос

Задать правильный method и `effect: 'mutation'`, no-store, timeout; сериализовать body в доменном модуле. Не добавлять retry, refresh/replay или автоматическую повторную отправку из UI.

GET `/subscriptions/trial`, GET payment-init, GET отправки verification/reset email и GET logout имеют побочные эффекты. Их нельзя запускать при render, prefetch, проверке доступности или переключении hash-вкладки.

### 3. Подтверждение и неопределённость

- Разделять HTTP-response, подтверждённый бизнес-успех, отказ и неизвестный результат.
- Timeout/connection loss после отправки не означают rollback. Ошибки decode/redirect также могут следовать после выполненной mutation. Не мапить их автоматически в «ничего не произошло».
- `configuration` отклоняется до fetch; остальные technical errors трактовать по контракту use case. HTTP5xx тоже может сопровождать частичный побочный эффект.
- Нужен ли readback, какие поля он подтверждает и что означает incomplete, решает домен. Не встраивать автоматический readback в transport.
- При outcome-unknown/incomplete применять существующий mutation-lock и безопасное обновление состояния; не повторять POST/DELETE/изменяющий GET для восстановления. Read-only reconciliation не всегда доказывает внешний банковский cleanup.
- Decoder должен читать/проверять данные, не запускать вложенные запросы и не изменять Auth.js. Финансовые URL валидируются отдельно в домене.

### 4. Revalidation и UI

Выполнять только согласованную адресную locale-aware revalidation после нужного уровня подтверждения. Пример: [Settings Actions](<../../src/app/[locale]/(public)/settings/actions.ts>) инвалидируют profile/profile-edit/settings после подтверждённых операций; ошибки после подтверждения не всегда равны полному успеху.

Не добавлять глобальную очистку cache. `router.refresh()` не является повтором mutation, но не должен снимать terminal lock той же identity. Pending/terminal состояние, переживающее hash-размонтирование, хранится в существующем controller выше панели; новый global store не требуется. Поздние ответы прежней identity должны игнорироваться.

## Особые операции: сохранять реальные контракты

| Операция / исходники                                                                                                                                                            | Обязательные ограничения                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trial: [transport](../../src/entities/subscription/api/trial.server.ts), [composition](../../src/auth.ts)                                                                       | Свежие identity/verified-email/canStartTrial; ровно1 mutating GET;200 + readback active trial с backend future endDate. Не вычислять срок самостоятельно. Не требовать feature flag/active profile. Не повторять unknown/incomplete.                                                                                        |
| Payment-init: [transport/URL validation](../../src/entities/subscription/api/paymentInit.server.ts), [composition](../../src/auth.ts)                                           | Проверить актуальные gate/catalog, tariff ID, email и согласия.200 text URL; HTTPS trusted provider whitelist. Не fetch-ить paymentUrl и не принимать его из client query/hash. Возврат с банка не доказательство оплаты.                                                                                                   |
| Subscription cancellation: [transport](../../src/entities/subscription/api/cancelSubscription.server.ts), [composition](../../src/auth.ts)                                      | Expected UUID пользовательской подписки проверяется по свежему snapshot; backend body получает trusted userId и numeric tariff subscriptionId.200 empty; readback canceled с прежним endDate. Частично изменённое state не доказывает банковский cleanup после failed DELETE.                                               |
| Password change: [auth composition](../../src/auth.ts), [backendAuth](../../src/entities/auth/api/backendAuth.server.ts)                                                        | Существующий PATCH возвращает access token/refresh cookie. Trusted replacement в writable context проверяет identity/expiry и сохраняет абсолютный session deadline. Не принимать tokens из клиентского session.update; callbacks/JWT/rotation не менять без отдельной задачи.                                              |
| Avatar: [Action](<../../src/app/[locale]/(public)/profile/actions.ts>), [composition](../../src/auth.ts)                                                                        | Сохранить PNG/base64/size checks, текущий PATCH и проверку response identity/avatar URL. Не открывать generic client user-patch API.                                                                                                                                                                                        |
| Account deletion: [domain operation](../../src/entities/profile/api/accountDeletion.server.ts), [UI completion](../../src/widgets/profile/settings/ui/DeleteAccountSection.tsx) | Свежая identity и точный username без trim/case/Unicode normalization. Один DELETE;200 с точным message подтверждает успех, readback не обязателен. Unknown не повторять. Только после success UI фиксирует account-deleted, выполняет signOut и locale-aware registration. Ошибка signOut допускает повтор только signOut. |
| Profile management: [domain operations](../../src/entities/profile/api/profileManagement.server.ts)                                                                             | Ownership, expected active profile, UUID, лимиты/unfinished profile, readback и username confirmation остаются серверными. Проверки до POST не дают атомарной гарантии против параллельного создания.                                                                                                                       |
| Telegram: [domain operation](../../src/entities/profile/api/telegram.server.ts)                                                                                                 | Signed Widget fields сохраняются без нормализации; frontend проверяет shape/size, backend проверяет HMAC. No payload/hash/credentials logs.                                                                                                                                                                                 |

Удаление аккаунта не блокируется подпиской и не инициирует её отмену. Существующий backend не гарантирует прекращение внешних регулярных списаний после удаления; это известный согласованный риск, а не основание молча менять UI/контракт в транспортной задаче.

Для всех этих операций разрешены тесты только с mocks и вымышленными идентификаторами. Не использовать настоящий тестовый аккаунт, не выполнять DELETE, trial, payment-init, cancel или банковские операции для QA. Ссылки на исходники не являются инструкцией вызывать endpoints.

## Тестовое окружение

Существующий [jest.config.ts](../../jest.config.ts) использует next/jest, jsdom и [jest.setup.ts](../../jest.setup.ts). В конфиге пути к polyfill и mock-файлам не совпадают с их фактическим расположением: [src/shared/config/jest](../../src/shared/config/jest). Общий setup обращается к window без node guard. Эти проблемы не исправлены документацией.

Поэтому нельзя обещать, что обычный `npm test` корректно запускает node BFF-тесты. Перед запуском:

- Проверить загрузку конфигурации: next/jest/build могут читать .env. Если проверка потребует защищённых файлов или backend, остановиться и описать ограничение.
- Использовать явно согласованный изолированный Jest-профиль для нужного набора. Не менять проектный конфиг без allowlist; временный профиль вне репозитория не должен читать .env, загружать next/jest или обходить обязательные проверки.
- Для server tests требуется node environment, mock server-only, доступные fetch/Response/Headers и mock global fetch до вызова transport. DOM setup там не нужен.
- Для UI tests нужен jsdom с существующими mocks static assets/router, mock Actions и session. Проверять зависимости barrel mocks после смены public imports.
- Для i18n regression проверять настоящий provider и runtime export conditions, не только JSON: production/development next-intl могут по-разному обрабатывать ICU tags. Rich messages рендерить существующим механизмом t.rich.
- Полезные реальные образцы: [backendHttp tests](../../src/shared/api/backendHttp.server.test.ts), [Payment History tests](../../src/entities/payment/api/paymentHistory.server.test.ts), [Settings snapshot tests](../../src/entities/profile/api/settings.server.test.ts), [auth/session tests](../../src/auth.session.test.ts).

Не добавлять .env values, персональные email, tokens, request URLs или response body в test snapshots/логи. Mock fetch должен полностью исключать настоящий network, а не только проверять число вызовов после потенциального реального запроса.

## Testing checklist

- [ ] Success: точные поля безопасной проекции, все прежние fixtures.
- [ ] Точные HTTP statuses:200/201/204 и отказы400/401/403/404/409/429/5xx по контракту; не общий response.ok.
- [ ] Invalid/missing/nullable DTO, duplicates, pagination, strict dates и отсутствие false success.
- [ ] Identity mismatch/ownership/expected profile/subscription; invalid input до HTTP.
- [ ] Timeout до headers и зависший body decoder; abort/cleanup; late response не меняет итог.
- [ ] Network, malformed JSON/text и redirect без раскрытия приватных деталей.
- [ ] Ровно нужное число запросов, метод/query/body/headers; никаких retry/refresh/logout или дополнительных profile reads.
- [ ] JSON/text/empty читаются внутри deadline; нет credentials/full DTO в UI result.
- [ ] Для mutation: precheck/readback, partial effects, incomplete/outcome-unknown, двойной клик и terminal lock через hash/refresh/смену identity.
- [ ] Для UI: React parity, locale-aware navigation, настоящие i18n messages, другие вкладки без регрессий.

## Статические проверки и завершение

Команды выбирать по [package.json](../../package.json), [ESLint](../../eslint.config.mjs), [Steiger](../../steiger.config.mjs), [TypeScript](../../tsconfig.json) и реальному test profile. Примеры ниже не инициируют backend-запросы:

```sh
./node_modules/.bin/eslint src/shared/api/backendHttp.server.ts
./node_modules/.bin/prettier --check docs/architecture/bff.md docs/architecture/api-guidelines.md
npm run lint:fsd -- --watch=false --reporter=json
git diff --check
```

Подставлять фактически затронутые существующие файлы; не проверять весь репозиторий автоисправлением. Для scoped TypeScript использовать согласованный профиль с нужными files/типами и noEmit/incremental=false; не создавать новые проектные config без разрешения. Полный TypeScript может содержать несвязанный baseline: отделять его от новых ошибок.

Steiger запускать однократно, без watch. Не отключать правила и не добавлять исключения для зелёного результата. После первых переносов был подтверждён baseline0 errors/3 warnings; каждую задачу сравнивать по rule/file/message, а не считать прошлый baseline новым запуском. Предупреждения: excessive-slicing и typo-in-layer-name для \_pages, segments-by-purpose для assets.

Не использовать `npm run prettier`, lint fix или lint-staged как read-only проверки: они могут менять файлы. Не обходить Husky. Не запускать Next.js build автоматически: он может читать environment и обращаться к backend при статической генерации.

В финальном отчёте перечислить реальные изменения, строки/контракты при transport refactor, тесты и статические проверки, непроведённый browser/backend QA, оставшиеся ограничения и allowlist. Для документации проверить Markdown, внутренние links/anchors, пути/примеры по исходникам и whitespace, включая новые untracked-файлы. Не утверждать, что тесты/build прошли, если они не запускались.

## Что пока не решено

Исправление стандартного Jest-профиля, полный перевод старых APIs, дополнительный HTTP helper layer, поддержка Cookie/FormData и декомпозиция auth.ts требуют отдельных задач. Новый domain result/mutation recovery согласуется по конкретному use case. Этот документ не меняет существующие React parity, auth или backend-контракты.
