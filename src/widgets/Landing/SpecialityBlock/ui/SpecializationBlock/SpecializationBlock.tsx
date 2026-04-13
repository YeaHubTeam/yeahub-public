import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { SpecializationButton } from '../SpecializationButton/SpecializationButton';
import { SpecializationCard } from '../SpecializationCard/SpecializationCard';
import styles from './SpecializationBlock.module.css';
import { mockSpecialization } from './mockSpecialization';

interface SpecializationBlockProps {
	locale: string;
}

export const SpecializationBlock = ({ locale }: SpecializationBlockProps) => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex direction="column" className={styles.container} dataTestId="SpecializationBlock">
			<Text variant="head2" className={styles.title}>
				{t(Landing.SPECIALIZATION_NEW_TITLE)}
			</Text>
			<ul className={styles['cards-list']} data-testid="SpecializationsCardList">
				{mockSpecialization.map((item) => (
					<li key={item.id}>
						<SpecializationCard
							title={item.title}
							description={t(item.description)}
							image={item.image}
							alt={item.alt}
							link={`${locale}${item.link}`}
						/>
					</li>
				))}
			</ul>
			<SpecializationButton variant="outline" className="button">
				{t(Landing.SPECIALIZATION_BUTTON)}
			</SpecializationButton>
		</Flex>
	);
};
