import { useTranslations } from 'next-intl';

import { Collections, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { Collection } from '../../model/types/collection';

interface CollectionTasksCountProps {
	tasksCount: Collection['tasksCount'];
}

export const CollectionTasksCount = ({ tasksCount }: CollectionTasksCountProps) => {
	const t = useTranslations(i18Namespace.collection);

	return (
		<Flex direction="column" gap="8">
			<Text variant="body3" color="black-700">
				{t(Collections.TASKS_ADDITIONAL_INFO)}
			</Text>
			<Chip label={String(tasksCount)} active />
		</Flex>
	);
};
