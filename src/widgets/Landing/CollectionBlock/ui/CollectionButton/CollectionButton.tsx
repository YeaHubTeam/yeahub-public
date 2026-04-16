'use client';

import { ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { ROUTES } from '@/shared/config';
import { Button, VariantType } from '@/shared/ui/Button';

interface CollectionButtonProps {
	children: ReactNode;
	className: string;
	variant?: VariantType;
	link?: string;
}

export const CollectionButton = ({ children, variant, link, className }: CollectionButtonProps) => {
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
			className={className}
			variant={variant ? variant : 'primary'}
			onClick={handleClickNavigation}
			dataTestId="AdditionalBlock_LinkButton"
		>
			{children}
		</Button>
	);
};
