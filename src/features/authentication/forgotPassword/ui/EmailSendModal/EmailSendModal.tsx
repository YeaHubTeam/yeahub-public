'use client';

import { useEffect, useRef, useState } from 'react';

import { useTranslations } from 'next-intl';

import { Auth, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Modal } from '@/shared/ui/Modal';
import { Text } from '@/shared/ui/Text';

import styles from './EmailSendModal.module.css';

interface EmailSendModalProps {
	isOpen: boolean;
	onClose: () => void;
	onResend: () => Promise<boolean>;
}

const OpenEmailSendModal = ({ onClose, onResend }: Omit<EmailSendModalProps, 'isOpen'>) => {
	const t = useTranslations(i18Namespace.auth);
	const [deadline, setDeadline] = useState(() => Date.now() + 60_000);
	const [now, setNow] = useState(Date.now);
	const [sending, setSending] = useState(false);
	const [failed, setFailed] = useState(false);
	const pending = useRef(false);
	const active = useRef(false);
	const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));

	useEffect(() => {
		active.current = true;
		return () => {
			active.current = false;
		};
	}, []);
	useEffect(() => {
		const timer = setInterval(() => {
			setNow(Date.now());
			if (Date.now() >= deadline) clearInterval(timer);
		}, 1000);
		return () => clearInterval(timer);
	}, [deadline]);

	const close = () => {
		if (!pending.current && Date.now() >= deadline) onClose();
	};
	const resend = async () => {
		if (pending.current || Date.now() < deadline) return;
		pending.current = true;
		setSending(true);
		setFailed(false);
		try {
			const success = await onResend();
			if (!active.current) return;
			if (success === true) {
				setDeadline(Date.now() + 60_000);
				setNow(Date.now());
			} else setFailed(true);
		} catch {
			if (active.current) setFailed(true);
		} finally {
			pending.current = false;
			if (active.current) setSending(false);
		}
	};

	return (
		<Modal
			isOpen
			onClose={close}
			title={t(Auth.FORGOT_PASSWORD_MODAL_TITLE)}
			className={styles.modal}
		>
			<Flex justify="center" align="center" direction="column">
				<Text variant="body2" className={styles.subtitle}>
					{t(Auth.FORGOT_PASSWORD_MODAL_SUBTITLE)}
				</Text>
				<div role="timer" className={styles.timer}>
					<Text variant="body2">{t(Auth.FORGOT_PASSWORD_MODAL_WAIT, { seconds })}</Text>
				</div>
				{failed && (
					<div role="alert">
						<Text variant="body2" color="red-700">
							{t(Auth.FORGOT_PASSWORD_ERROR)}
						</Text>
					</div>
				)}
				<Button
					type="button"
					variant="tertiary-link"
					className={styles.button}
					disabled={seconds > 0 || sending}
					aria-busy={sending}
					onClick={() => void resend()}
				>
					{t(Auth.FORGOT_PASSWORD_MODAL_SUBMIT)}
				</Button>
			</Flex>
		</Modal>
	);
};

export const EmailSendModal = ({ isOpen, onClose, onResend }: EmailSendModalProps) =>
	isOpen ? <OpenEmailSendModal onClose={onClose} onResend={onResend} /> : null;
