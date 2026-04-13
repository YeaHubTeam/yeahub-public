import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { CollectionButton } from '../CollectionButton/CollectionButton';
import styles from './AdditionalBlock.module.css';

export const AdditionalBlock = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex dataTestId="AdditionalBlock" className={styles['additional-block']}>
			<Card
				dataTestId="AdditionalBlock_First"
				className={styles['additional-first']}
				withOutsideShadow
			>
				<Text variant="body3" color="white-900">
					{t(Landing.COLLECTION_ADDITIONAL_FIRST)}
				</Text>
			</Card>

			<Card
				dataTestId="AdditionalBlock_Second"
				className={styles['additional-second']}
				withOutsideShadow
			>
				<Text variant="body3">{t(Landing.COLLECTION_ADDITIONAL_SECOND)}</Text>
			</Card>

			<Card
				dataTestId="AdditionalBlock_Third"
				className={styles['additional-third']}
				withOutsideShadow
			>
				<Text variant="body5" className={styles['adaptive-text']}>
					{t(Landing.COLLECTION_ADDITIONAL_THIRD)}
				</Text>
			</Card>

			<CollectionButton className={styles.button}>{t(Landing.COLLECTION_LINK)}</CollectionButton>
		</Flex>
	);
};
