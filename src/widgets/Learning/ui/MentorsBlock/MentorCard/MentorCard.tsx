import { useTranslations } from 'next-intl';

import { Guru, GurusItem } from '@/entities/guru';
import { Learning, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

import styles from './MentorCard.module.css';

interface MentorCardProps {
	guru: Guru;
}

export const MentorCard = ({ guru }: MentorCardProps) => {
	const t = useTranslations(i18Namespace.learning);

	const { socials, description } = guru;

	return (
		<Card
			withOutsideShadow
			actionTitle={t(Learning.MENTORS_LINK)}
			actionRoute={socials.landing || ''}
			isActionPositionBottom
			className={styles.card}
			size="small"
		>
			<GurusItem
				guru={guru}
				description={description}
				avatarSize={53}
				avatarIcon={{ icon: 'tickWithBackground' }}
				layout="row"
			/>
		</Card>
	);
};
