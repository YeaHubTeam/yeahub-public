import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { type Resource } from '@/entities/resource';
import { Specialization } from '@/entities/specialization';
import { Resources, i18Namespace } from '@/shared/config';
import { RESOURCES_PER_PAGE } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';
import { ResourcesList } from '@/widgets/resources/ResourcesList';

import { ResourcesFilterPanel } from '../ResourcesFilterPanel/ResourcesFilterPanel';
import { ResourcesPagePagination } from '../ResourcesPagePagination/ResourcesPagePagination';
import styles from './ResourcesPage.module.css';

interface ResourcesPageProps {
	locale: string;
	page: number;
	resources: Resource[];
	total: number;
	limit: number;
	hasFilters: boolean;
	currentSpec: Specialization;
}

export const ResourcesPage = ({
	locale,
	page,
	resources,
	total,
	limit,
	hasFilters,
	currentSpec,
}: ResourcesPageProps) => {
	setRequestLocale(locale);
	const t = useTranslations(i18Namespace.resources);
	return (
		<Flex gap="20" align="start">
			<Card className={styles.main}>
				<Flex className={styles.header}>
					<Text variant="body6" isMainTitle>
						{t(Resources.HEADER_TITLE)}
					</Text>
				</Flex>
				<ResourcesList resources={resources} hasFilters={hasFilters} />
				{total > RESOURCES_PER_PAGE && (
					<ResourcesPagePagination total={total} limit={limit} currentPage={page} />
				)}
			</Card>
			<Card className={styles.filters}>
				<ResourcesFilterPanel currentSpec={currentSpec} />
			</Card>
		</Flex>
	);
};
