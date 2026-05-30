'use client';

import { useRouter } from 'next/navigation';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';

import { Button } from '../Button';
import { ButtonProps } from '../Button/types';
import styles from './BackButton.module.css';

/**
 * Button to return to the previous page
 */

type BackButtonProps = Pick<ButtonProps, 'size'>;

export const BackButton = ({ size = 'medium' }: BackButtonProps) => {
	const router = useRouter();
	const t = useTranslations(i18Namespace.translation);

	const onBack = () => {
		router.back();
	};

	return (
		<Button
			size={size}
			onClick={onBack}
			preffix={<Icon icon="altArrowLeft" color="purple-700" size={20} />}
			variant="link-purple"
			className={styles['back-button']}
		>
			{t(Translation.RETURN)}
		</Button>
	);
};
