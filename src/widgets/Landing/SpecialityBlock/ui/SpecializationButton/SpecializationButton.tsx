'use client';

import { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config';
import { Button, VariantType } from '@/shared/ui/Button';

import styles from './SpecializationButton.module.css';

interface SpecializationButtonProps {
	children: ReactNode;
	className: 'button' | 'card-button';
	variant?: VariantType;
	link?: string;
}

export const SpecializationButton = ({
	children,
	variant,
	className,
	link,
}: SpecializationButtonProps) => {
	const router = useRouter();
	const handleClickNavigation = () => {
		if (link) {
			router.push(link);
		} else {
			router.push(ROUTES.login);
		}
	};

	return (
		<Button
			variant={variant ? variant : 'primary'}
			className={styles[className]}
			onClick={handleClickNavigation}
			dataTestId="SpecializationButton"
		>
			{children}
		</Button>
	);
};
