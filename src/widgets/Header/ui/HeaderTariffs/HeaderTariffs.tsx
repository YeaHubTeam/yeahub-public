'use client';

import { useState } from 'react';

import { Button } from '@/shared/ui/Button';
import { Modal } from '@/shared/ui/Modal';
import { SubscriptionsList } from '@/widgets/SubscriptionsList';

export const HeaderTariffs = () => {
	const [isOpen, setIsOpen] = useState(false);

	const onOpenModal = () => setIsOpen(true);
	const onCloseModal = () => setIsOpen(false);

	return (
		<>
			<Button variant="outline" onClick={onOpenModal}>
				Тарифы
			</Button>

			<Modal isOpen={isOpen} onClose={onCloseModal} title="Тарифы">
				<span style={{ padding: '20px', display: 'block', textAlign: 'center' }}>
					<SubscriptionsList />
				</span>
			</Modal>
		</>
	);
};
