'use client';

import { useTranslations } from 'next-intl';

import { Subscription, i18Namespace } from '@/shared/config';
import { useModal } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';

import { TariffsModal } from '../TariffsModal/TariffsModal';

export const TariffsButton = () => {
	const t = useTranslations(i18Namespace.subscription);

	const { isOpen, onOpen, onClose } = useModal();

	return (
		<>
			<Button variant="outline" onClick={onOpen}>
				{t(Subscription.TARIFFS)}
			</Button>
			{isOpen && <TariffsModal isOpen={isOpen} onClose={onClose} />}
		</>
	);
};
