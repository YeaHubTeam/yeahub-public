import { useTranslations } from 'next-intl';

import { Landing } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { AdditionalBlock } from '../AdditionalBlock/AdditionalBlock';
import { FiltersBlock } from '../FiltersBlock/FiltersBlock';
import { MainBlock } from '../MainBlock/MainBlock';
import styles from './CollectionBlock.module.css';

export const CollectionBlock = () => {
	const t = useTranslations('landing');

	return (
		<section data-testid="CollectionBlock">
			<Flex gap="20" direction="column" align="center" className={styles['collection-wrapper']}>
				<div data-testid="CollectionBlock_TitleBlock" className={styles['title-block']}>
					<Text variant="head3" className={styles.title}>
						{t(Landing.COLLECTION_TITLE).toUpperCase()}
					</Text>
					<Text variant="body3" className={styles.subtitle}>
						{t(Landing.COLLECTION_SUBTITLE)}
					</Text>
				</div>
				<FiltersBlock />
				<MainBlock />
				<AdditionalBlock />
			</Flex>
		</section>
	);
};
