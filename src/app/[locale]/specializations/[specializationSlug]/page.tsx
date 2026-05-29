import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getSpecializationBySlug, getSpecializationSlugs } from '@/entities/specialization';
import { Specializations, Translation, i18Namespace, locales } from '@/shared/config';
import { BackButton } from '@/shared/ui/BackButton';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './SpecializationSlugPage.module.css';

interface PageProps {
	params: Promise<{ locale: string; specializationSlug: string }>;
}

export const dynamic = 'auto';

export const generateStaticParams = async () => {
	try {
		const { data: specializations } = await getSpecializationSlugs();

		return locales.flatMap((locale) =>
			specializations.map((specialization) => ({
				locale,
				specializationSlug: specialization.slug,
			})),
		);
	} catch (error) {
		console.error(error);
		return [];
	}
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { locale, specializationSlug } = await params;

	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.translation });
	const specialization = await getSpecializationBySlug(specializationSlug).catch(() => null);

	if (!specialization) {
		return { title: t(Translation.ERROR_404_TITLE) };
	}

	const description = specialization.description || specialization.title;
	const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
	const canonical = `${baseUrl}/${locale}/specializations/${specializationSlug}`;

	return {
		title: specialization.title,
		description,
		alternates: {
			canonical,
		},
		openGraph: {
			title: specialization.title,
			description,
			type: 'website',
			url: canonical,
		},
	};
}

const SpecializationSlugPage = async ({ params }: PageProps) => {
	const { locale, specializationSlug } = await params;
	setRequestLocale(locale);

	const t = await getTranslations({ locale, namespace: i18Namespace.specialization });
	const specialization = await getSpecializationBySlug(specializationSlug).catch(() => null);

	if (!specialization) {
		notFound();
	}

	return (
		<section className={styles.container}>
			<Flex>
				<BackButton size="x-large" />
			</Flex>
			<Text variant="head2" isMainTitle className={styles.title}>
				Подготовка к собеседованию:
				<br />
				{specialization.title}
			</Text>
			<Text variant="body3" className={styles.description}>
				{specialization.description || t(Specializations.TITLE_MAIN)}
			</Text>
		</section>
	);
};

export default SpecializationSlugPage;
