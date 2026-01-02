import React from 'react';

import { useTranslations } from 'next-intl';

import { Guru, GurusItem } from '@/entities/guru';
import { Learning, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';

type GurusCardProps = {
	guru: Guru;
};

const GurusCard = ({ guru }: GurusCardProps) => {
	const t = useTranslations(i18Namespace.learning);

	const { socials, description } = guru;

	return (
		<Card
			withOutsideShadow
			actionRoute={socials.landing || ''}
			actionTitle={t(Learning.GURU_LINK)}
			isActionPositionBottom
		>
			<GurusItem
				guru={guru}
				avatarSize={65}
				description={description}
				showSocials={false}
				layout="column"
			/>
		</Card>
	);
};

export default GurusCard;
