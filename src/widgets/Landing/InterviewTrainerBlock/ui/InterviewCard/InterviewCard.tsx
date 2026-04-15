'use client';

import Image, { StaticImageData } from 'next/image';
import { useRouter } from 'next/navigation';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Landing, ROUTES, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './InterviewCard.module.css';

interface InterviewCardProps {
	iconType: 'settings' | 'student';
	img: StaticImageData;
	text: string;
	locale: string;
}

export const InterviewCard = ({ img, text, iconType, locale }: InterviewCardProps) => {
	const t = useTranslations(i18Namespace.landing);
	const router = useRouter();
	const { isMobile } = useScreenSize();

	const handleClickNavigation = () => {
		router.push(`${locale}${ROUTES.quiz.new.page}`);
	};

	return (
		<Flex
			gap="14"
			direction={isMobile ? 'column' : 'row'}
			align={isMobile ? 'center' : 'normal'}
			className={styles.card}
		>
			<div className={styles['image-wrapper']}>
				<Image src={img} alt="example" className={styles['card-image']} height={180} />
			</div>
			<Flex gap="16" direction="column" className={styles['card-text']}>
				<div className={classNames(styles['text-icon'], styles[`icon-${iconType}`])}>
					<Icon color={iconType === 'settings' ? 'yellow-900' : 'green-900'} icon={iconType} />
				</div>
				<Text variant="body3">{text}</Text>
				<Button onClick={handleClickNavigation}>{t(Landing.TRAINING_INTERVIEW_LINK)}</Button>
			</Flex>
		</Flex>
	);
};
