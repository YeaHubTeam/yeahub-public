'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';

import { Button } from '../Button';
import styles from './BackButton.module.css';

/**
 * Button to return to the previous page
 */

export const BackButton = () => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.translation);

	const onBack = () => {
		router.back();
	};

	return (
		<Button
			size="medium"
			onClick={onBack}
			preffix={<Icon icon="altArrowLeft" color="purple-700" size={20} />}
			variant="link-purple"
			className={styles['back-button']}
		>
			{t(Translation.RETURN)}
		</Button>
	);
};
