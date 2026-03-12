import type { MetadataRoute } from 'next';

import { getCollectionsList } from '@/entities/collection';
import { getQuestionsList } from '@/entities/question';
import { getSpecializationSlugs } from '@/entities/specialization';
import { locales } from '@/shared/config';
import { APP_ROUTE } from '@/shared/config/router/constants';

const BATCH_SIZE = 100;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || APP_ROUTE).replace(/\/$/, '');

	const urls: MetadataRoute.Sitemap = [];

	const staticPaths = [
		'',
		'/landing',
		'/docs',
		'/learning',
		'/quiz',
		'/quiz/new',
		'/quiz/result',
		'/media',
		'/hh-analytics',
		'/avos',
		'/collections',
		'/resources',
		'/questions',
	];

	for (const locale of locales) {
		for (const path of staticPaths) {
			urls.push({
				url: `${baseUrl}/${locale}${path || ''}`,
				lastModified: new Date(),
				changeFrequency: path === '' ? 'weekly' : ('monthly' as const),
				priority: path === '' ? 1 : 0.8,
			});
		}
	}

	try {
		const { data: specializations } = await getSpecializationSlugs();

		for (const locale of locales) {
			for (const spec of specializations) {
				urls.push({
					url: `${baseUrl}/${locale}/questions/${spec.slug}`,
					lastModified: new Date(),
					changeFrequency: 'weekly' as const,
					priority: 0.9,
				});
				urls.push({
					url: `${baseUrl}/${locale}/collections/${spec.slug}`,
					lastModified: new Date(),
					changeFrequency: 'weekly' as const,
					priority: 0.8,
				});
				urls.push({
					url: `${baseUrl}/${locale}/resources/${spec.slug}`,
					lastModified: new Date(),
					changeFrequency: 'weekly' as const,
					priority: 0.8,
				});
			}
		}

		for (const spec of specializations) {
			try {
				const firstPage = await getQuestionsList({
					specializationId: spec.id,
					page: 1,
					limit: BATCH_SIZE,
				});
				const questionSlugs = firstPage.data.map((q) => q.slug);
				const totalPages = Math.ceil(firstPage.total / BATCH_SIZE);

				for (let page = 2; page <= totalPages; page++) {
					const response = await getQuestionsList({
						specializationId: spec.id,
						page,
						limit: BATCH_SIZE,
					});
					questionSlugs.push(...response.data.map((q) => q.slug));
				}

				for (const locale of locales) {
					for (const slug of questionSlugs) {
						urls.push({
							url: `${baseUrl}/${locale}/questions/${spec.slug}/${slug}`,
							lastModified: new Date(),
							changeFrequency: 'monthly' as const,
							priority: 0.7,
						});
					}
				}
			} catch {
				// пропускаем специализацию при ошибке
			}
		}

		for (const spec of specializations) {
			try {
				const firstPage = await getCollectionsList({
					specializations: spec.id,
					page: 1,
					limit: BATCH_SIZE,
				});
				const collectionSlugs = firstPage.data.map((c) => c.slug);
				const totalPages = Math.ceil(firstPage.total / BATCH_SIZE);

				for (let page = 2; page <= totalPages; page++) {
					const response = await getCollectionsList({
						specializations: spec.id,
						page,
						limit: BATCH_SIZE,
					});
					collectionSlugs.push(...response.data.map((c) => c.slug));
				}

				for (const locale of locales) {
					for (const slug of collectionSlugs) {
						urls.push({
							url: `${baseUrl}/${locale}/collections/${spec.slug}/${slug}`,
							lastModified: new Date(),
							changeFrequency: 'monthly' as const,
							priority: 0.7,
						});
					}
				}
			} catch {
				// пропускаем специализацию при ошибке
			}
		}
	} catch (error) {
		console.error('Ошибка при построеннии карты сайта', error);
	}

	return urls;
}
