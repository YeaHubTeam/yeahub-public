'use client';

import { Modal } from '@/shared/ui/Modal';
import { SubscriptionsList } from '@/widgets/SubscriptionsList';

import styles from './TariffsModal.module.css';

interface TariffsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const TariffsModal = ({ isOpen, onClose }: TariffsModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} className={styles.modal}>
			<SubscriptionsList />
		</Modal>
	);
};
