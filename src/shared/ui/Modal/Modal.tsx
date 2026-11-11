'use client';

import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import classNames from 'classnames';
import { createPortal } from 'react-dom';

import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import textStyles from '@/shared/ui/Text/Text.module.css';

import styles from './Modal.module.css';
import { ModalProps } from './ModalTypes';
import {
	closeIconColors,
	modalTestIds,
	outlineButtonVariants,
	primaryButtonVariants,
	titleColors,
} from './constants';

const createPortalRoot = () => {
	const modalRoot = document.createElement('div');
	modalRoot.setAttribute('id', 'modal-root');

	return modalRoot;
};

const subscribeToMount = () => () => {};

export const Modal = ({
	isOpen,
	onClose,
	buttonPrimaryText,
	buttonOutlineText,
	buttonPrimaryClick,
	buttonOutlineClick,
	buttonPrimaryDisabled,
	buttonOutlineDisabled,
	withCloseIcon = true,
	hasPadding = true,
	variant = 'default',
	dataTestId = 'Modal',
	children,
	title,
	contentClassName = '',
	className = '',
	view = 'default',
}: ModalProps) => {
	const mounted = useSyncExternalStore(
		subscribeToMount,
		() => true,
		() => false,
	);
	const portal = useMemo(() => (mounted ? createPortalRoot() : null), [mounted]);
	const overlayRef = useRef<HTMLDivElement>(null);

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		const target = e.target as Node;
		if (overlayRef.current && !overlayRef.current.contains(target)) {
			onClose();
		}
	};
	const handleClickXCircle = (e: React.MouseEvent<SVGElement>) => {
		e.stopPropagation();
		onClose();
	};
	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement | SVGElement>) => {
		e.stopPropagation();
		if (e.key === 'Escape') {
			onClose();
		}
	};

	useEffect(() => {
		if (!isOpen || !portal) return;
		const body = document.body;
		const previousOverflow = body.style.overflow;
		body.style.overflow = 'hidden';
		body.appendChild(portal);
		return () => {
			portal.remove();
			body.style.overflow = previousOverflow;
		};
	}, [isOpen, portal]);

	if (!portal || !isOpen) return null;

	const isButtons = buttonOutlineText || buttonPrimaryText;

	return createPortal(
		<div
			role="button"
			aria-labelledby="У вас открыто модальное окно"
			tabIndex={0}
			className={classNames(styles.overlay, { [styles['modal-open']]: isOpen })}
			data-testid={modalTestIds.modalOverlay}
			onKeyDown={handleKeyDown}
			onClick={handleOverlayClick}
		>
			<div
				data-testid={dataTestId}
				className={classNames(
					className,
					styles.modal,
					styles[`variant-${variant}-modal`],
					styles[`view-${view}-modal`],
				)}
				ref={overlayRef}
			>
				{withCloseIcon && (
					<Icon
						icon="closeCircle"
						type="button"
						className={styles['x-circle']}
						color={closeIconColors[variant]}
						onClick={handleClickXCircle}
						tabIndex={0}
						aria-label="Закрыть модальное окно"
						dataTestId={modalTestIds.modalCloseIcon}
						onKeyDown={handleKeyDown}
					/>
				)}
				<div
					data-testid={modalTestIds.modalContentWrapper}
					className={classNames(contentClassName, { [styles['content-wrapper']]: hasPadding })}
				>
					{title && (
						<Text
							className={classNames(styles.title, styles[`variant-${variant}-title`])}
							variant="body5-accent"
							color={titleColors[variant]}
							dataTestId={modalTestIds.modalTitle}
						>
							{title}
						</Text>
					)}
					{children && (
						<div
							className={classNames(styles.text, textStyles.body3, textStyles['text-black-900'])}
						>
							{children}
						</div>
					)}
				</div>
				{isButtons && (
					<div className={classNames(styles.buttons, styles[`variant-${variant}-buttons`])}>
						{buttonPrimaryText && (
							<Button
								style={{ maxWidth: '240px' }}
								variant={primaryButtonVariants[variant]}
								size="large"
								onClick={buttonPrimaryClick}
								disabled={buttonPrimaryDisabled}
								dataTestId={modalTestIds.modalPrimaryButton}
								fullWidth
							>
								{buttonPrimaryText}
							</Button>
						)}
						{buttonOutlineText && (
							<Button
								style={{ backgroundColor: 'transparent', maxWidth: '240px' }}
								variant={outlineButtonVariants[variant]}
								size="large"
								onClick={buttonOutlineClick}
								disabled={buttonOutlineDisabled}
								dataTestId={modalTestIds.modalOutlineButton}
								fullWidth
							>
								{buttonOutlineText}
							</Button>
						)}
					</div>
				)}
			</div>
		</div>,
		portal,
	);
};
