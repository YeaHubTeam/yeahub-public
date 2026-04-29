import type { MetadataRoute } from 'next';

const QUESTIONS_CLEAN_PARAMS = 'page&skills&complexity&rate&titleOrDescription&status';

const YANDEX_QUESTIONS_PATHS = [
	'/ru/questions/',
	'/ru/questions/react-frontend-developer',
	'/ru/questions/golang-backend-developer',
	'/ru/questions/python-backend-developer',
	'/ru/questions/qa-engineer',
	'/ru/questions/java-backend-developer',
	'/ru/questions/c-backend-developer',
	'/ru/questions/1c-analitik',
	'/ru/questions/ccplusplus-backend-developer',
	'/ru/questions/data-scientist',
	'/ru/questions/php-backend-developer',
	'/ru/questions/nodejs-backend-developer',
	'/ru/questions/android-mobile-developer',
	'/ru/questions/business-analyst',
	'/ru/questions/rust-backend-developer',
	'/ru/questions/game-developer',
	'/ru/questions/system-analyst',
] as const;

function buildYandexCleanParamDisallow(): string {
	const lines = [
		...YANDEX_QUESTIONS_PATHS.map((path) => `Clean-param: ${QUESTIONS_CLEAN_PARAMS} ${path}`),
		'Clean-param: page&companies /ru/collections/',
		'Clean-param: page&companies /ru/collections/react-frontend-developer',
		'Clean-param: page&mode&specialization /ru/hh-analytics',
		'Clean-param: limit&specialization /ru/quiz/new',
		'Clean-param: count&specialization&specializationId /ru/quiz',
		'Clean-param: _ym_debug&_ym_status-check&_ym_lang /ru',
		'Clean-param: page /ru/resources/',
		'Clean-param: page /ru/resources/react-frontend-developer',
	];
	return `\n${lines.join('\n')}`;
}

export default function robots(): MetadataRoute.Robots {
	const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');

	return {
		rules: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'GPTBot',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'ChatGPT-User',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'Google-Extended',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'Claude-Web',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'CCBot',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'PerplexityBot',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'YouBot',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'OAI-Search',
				allow: '/',
				disallow: ['/api/', '/_next/'],
			},
			{
				userAgent: 'Yandex',
				allow: '/',
				disallow: buildYandexCleanParamDisallow(),
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
