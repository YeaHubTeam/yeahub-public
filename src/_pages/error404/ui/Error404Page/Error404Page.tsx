'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import NotFoundImg from '@/shared/assets/images/404.avif';
import { Translation, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

import styles from './Error404Page.module.css';

const Error404Page = () => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.translation);
	const handleBackBtnClick = () => router.back();

	return (
		<Card className={styles.wrapper}>
			<Image src={NotFoundImg} alt={t(Translation.ERROR_404_TITLE)} className={styles.image} />
			<div className={styles.content}>
				<h2 className={styles.title}>{t(Translation.ERROR_404_TITLE)}</h2>
				<Button size="large" onClick={handleBackBtnClick}>
					{t(Translation.ERROR_404_BUTTON)}
				</Button>
			</div>
		</Card>
	);
};

export default Error404Page;
