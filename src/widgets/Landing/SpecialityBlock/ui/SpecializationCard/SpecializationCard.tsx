import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { IMockSpeciality } from '../SpecializationBlock/mockSpecialization';
import { SpecializationButton } from '../SpecializationButton/SpecializationButton';
import styles from './SpecializationCard.module.css';

export const SpecializationCard = ({ title, description, image, alt, link }: IMockSpeciality) => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex direction="column" justify="between" className={styles.card}>
			<Flex direction="row" justify="between" align="start" className={styles['card-title']}>
				<Text variant="body6">{title}</Text>
				<Image src={image} alt={alt!} />
			</Flex>
			<Flex direction="column" justify="end">
				<Text variant="body3" className={styles['card-description']}>
					{description}
				</Text>
				<SpecializationButton className="card-button" link={link}>
					{t(Landing.SPECIALIZATION_CARD_BUTTON)}
				</SpecializationButton>
			</Flex>
		</Flex>
	);
};
