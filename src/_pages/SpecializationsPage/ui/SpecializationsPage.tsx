import Link from 'next/link';

import { getTranslations } from 'next-intl/server';

import type { GetSpecializationsListResponse } from '@/entities/specialization';
import { ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './SpecializationsPage.module.css';

interface SpecializationsPageProps {
	specializations: GetSpecializationsListResponse;
	locale: string;
}

export const SpecializationsPage = async ({
	specializations,
	locale,
}: SpecializationsPageProps) => {
	const t = await getTranslations(i18Namespace.specialization);
	const items = specializations.data || [];

	return (
		<Flex direction="column" gap="30" componentType="section" className={styles.container}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{t(Specializations.TITLE_PAGE)}
			</Text>

			<div className={styles.grid}>
				{items.map((specialization) => (
					<Link
						key={specialization.id}
						href={`/${locale}${route(ROUTES.specializations.detail.page, specialization.slug)}`}
						className={styles.link}
					>
						<Card className={styles.card} withOutsideShadow>
							<Text variant="head5">{specialization.title}</Text>
						</Card>
					</Link>
				))}
			</div>
		</Flex>
	);
};
