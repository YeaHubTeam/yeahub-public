'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import { Subscription, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import { TariffsModal } from '../TariffsModal/TariffsModal';

export const TariffsButton = () => {
	const t = useTranslations(i18Namespace.subscription);

	const [isOpen, setIsOpen] = useState(false);

	const handleOpen = () => setIsOpen(true);
	const handleClose = () => setIsOpen(false);

	return (
		<>
			<Button variant="outline" onClick={handleOpen}>
				{t(Subscription.TARIFFS)}
			</Button>
			<TariffsModal isOpen={isOpen} onClose={handleClose} />
		</>
	);
};
