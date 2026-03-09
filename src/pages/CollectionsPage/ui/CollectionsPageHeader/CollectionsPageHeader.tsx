import React from 'react';

import { useTranslations } from 'next-intl';

import { GetSpecializationsListResponse, Specialization } from '@/entities/specialization';
import { Collections, i18Namespace } from '@/shared/config';
import { FiltersDrawer } from '@/shared/ui/FiltersDrawer';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { CollectionsFilterPanel } from '../CollectionsFilterPanel/CollectionsFilterPanel';
import styles from './CollectionsPageHeader.module.css';

interface CollectionsPageHeaderProps {
	currentSpecialization: Specialization;
	initialSpecializations?: GetSpecializationsListResponse | null;
}

export const CollectionsPageHeader = ({
	currentSpecialization,
	initialSpecializations,
}: CollectionsPageHeaderProps) => {
	const t = useTranslations(i18Namespace.collection);

	return (
		<>
			<Flex className={styles.header} direction="row" justify="between">
				<Text variant="body6" isMainTitle>
					{t(Collections.COLLECTIONS_TITLE)}
				</Text>
				<FiltersDrawer>
					<CollectionsFilterPanel
						currentSpecialization={currentSpecialization}
						initialSpecializations={initialSpecializations}
					/>
				</FiltersDrawer>
			</Flex>
			<hr className={styles.divider} />
		</>
	);
};
