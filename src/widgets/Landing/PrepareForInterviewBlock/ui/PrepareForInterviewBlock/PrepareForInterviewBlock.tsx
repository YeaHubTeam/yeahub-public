import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Landing, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './PrepareForInterviewBlock.module.css';

export const PrepareForInterviewBlock = () => {
	const t = useTranslations(i18Namespace.landing);
	const specializationListRoute = route(ROUTES.specializations.page);

	return (
		<section className={styles.wrapper}>
			<div className={styles['title-block']}>
				<Text variant="head3" className={styles.title}>
					{t(Landing.PREPARE_INTERVIEW_TITLE)}
				</Text>
				<Text variant="body3-accent" className={styles.subtitle}>
					{t(Landing.PREPARE_INTERVIEW_SUBTITLE)}
				</Text>
			</div>
			<Link href={specializationListRoute} className={styles.link}>
				{t(Landing.SPECIALIZATION_LIST_LINK)}
				<Icon icon="arrowRight" size={24} />
			</Link>
			<ul className={styles['cards-list']}></ul>
		</section>
	);
};
