import { getTranslations } from 'next-intl/server';

import type { GetSpecializationsListResponse } from '@/entities/specialization';
import { Specializations, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './SpecializationsPage.module.css';

interface SpecializationsPageProps {
	specializations: GetSpecializationsListResponse;
}

export const SpecializationsPage = async ({ specializations }: SpecializationsPageProps) => {
	const t = await getTranslations(i18Namespace.specialization);
	const items = specializations.data || [];

	return (
		<Flex direction="column" gap="30" componentType="section" className={styles.container}>
			<Text variant="head2" isMainTitle className={styles.title}>
				{t(Specializations.TITLE_PAGE)}
			</Text>

			<div className={styles.grid}>
				{items.map((specialization) => (
					<Card key={specialization.id} className={styles.card} withOutsideShadow size="small">
						<Text variant="head5">{specialization.title}</Text>
					</Card>
				))}
			</div>
		</Flex>
	);
};
