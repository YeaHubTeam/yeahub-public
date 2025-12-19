import { useTranslations } from 'next-intl';

import { Collections, i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { Collection } from '../../model/types/collection';
import styles from './CollectionQuestionsCount.module.css';

interface CollectionQuestionsCountProps {
	questionsCount: Collection['questionsCount'];
}

export const CollectionQuestionsCount = ({ questionsCount }: CollectionQuestionsCountProps) => {
	const t = useTranslations(i18Namespace.collection);

	return (
		<Flex direction="column" gap="8">
			<Text variant="body3" color="black-700">
				{t(Collections.QUESTIONS_ADDITIONAL_INFO)}
			</Text>
			<Chip label={String(questionsCount)} active className={styles.chip} />
		</Flex>
	);
};
