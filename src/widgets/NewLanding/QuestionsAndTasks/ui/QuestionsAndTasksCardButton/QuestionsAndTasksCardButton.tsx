'use client';

import React, { ReactNode } from 'react';

import { Button } from '@/shared/ui/Button';
import { useRouter } from 'next/navigation';

interface CardButtonProps {
	children: ReactNode;
	className: string;
	link: string;
}

export const QuestionsAndTasksCardButton = ({link, className, children }: CardButtonProps) => {
	const router = useRouter();

	const handleClickNavigation = () => {
		router.push(link);
	};
	
	return (
		<>
			<Button 
				onClick={handleClickNavigation}
				className={className}>
					{children}
			</Button>
		</>
	);
};
