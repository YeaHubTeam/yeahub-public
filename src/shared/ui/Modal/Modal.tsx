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

const isAvailable = (element: HTMLElement) => {
	if (!element.isConnected || element.matches(':disabled, input[type="hidden"]')) return false;
	for (let current: HTMLElement | null = element; current; current = current.parentElement) {
		if (
			current.hidden ||
			current.hasAttribute('inert') ||
			current.getAttribute('aria-hidden') === 'true'
		)
			return false;
		const style = getComputedStyle(current);
		if (
			style.display === 'none' ||
			style.visibility === 'hidden' ||
			style.visibility === 'collapse'
		)
			return false;
	}
	return true;
};
const focusableElements = (dialog: HTMLElement) =>
	Array.from(
		dialog.querySelectorAll<HTMLElement>(
			'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]',
		),
	)
		.filter((element) => element.tabIndex >= 0 && isAvailable(element))
		.sort(
			(a, b) => (a.tabIndex > 0 ? a.tabIndex : Infinity) - (b.tabIndex > 0 ? b.tabIndex : Infinity),
		);

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
	const closeRef = useRef(onClose);
	useEffect(() => {
		closeRef.current = onClose;
	}, [onClose]);

	const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
		e.stopPropagation();
		const target = e.target as Node;
		if (overlayRef.current && !overlayRef.current.contains(target)) {
			onClose();
		}
	};
	const handleClickXCircle = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		onClose();
	};

	useEffect(() => {
		if (!isOpen || !portal) return;
		const body = document.body;
		const previousOverflow = body.style.overflow;
		const opener = document.activeElement;
		body.style.overflow = 'hidden';
		body.appendChild(portal);
		const dialog = overlayRef.current;
		const isTopDialog = () => {
			const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
			return dialogs[dialogs.length - 1] === dialog;
		};
		const focusInside = () => {
			if (dialog) (focusableElements(dialog)[0] ?? dialog).focus();
		};
		const trapFocus = (event: FocusEvent) => {
			if (dialog && isTopDialog() && !dialog.contains(event.target as Node)) focusInside();
		};
		const trapKeys = (event: KeyboardEvent) => {
			if (!dialog || !isTopDialog()) return;
			if (event.key === 'Escape') {
				event.preventDefault();
				event.stopPropagation();
				closeRef.current();
				return;
			}
			if (event.key !== 'Tab') return;
			const elements = focusableElements(dialog);
			const first = elements[0],
				last = elements[elements.length - 1];
			if (!first) {
				event.preventDefault();
				dialog.focus();
				return;
			}
			const active = document.activeElement;
			if (
				!dialog.contains(active) ||
				active === dialog ||
				!elements.includes(active as HTMLElement)
			) {
				event.preventDefault();
				(event.shiftKey ? last : first).focus();
			} else if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		};
		document.addEventListener('focusin', trapFocus);
		document.addEventListener('keydown', trapKeys, true);
		focusInside();
		return () => {
			document.removeEventListener('focusin', trapFocus);
			document.removeEventListener('keydown', trapKeys, true);
			portal.remove();
			body.style.overflow = previousOverflow;
			if (opener instanceof HTMLElement && isAvailable(opener)) opener.focus();
		};
	}, [isOpen, portal]);

	if (!portal || !isOpen) return null;

	const isButtons = buttonOutlineText || buttonPrimaryText;

	return createPortal(
		<div
			role="presentation"
			className={classNames(styles.overlay, { [styles['modal-open']]: isOpen })}
			data-testid={modalTestIds.modalOverlay}
			onClick={handleOverlayClick}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title?.trim() || 'Модальное окно'}
				tabIndex={-1}
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
					<button
						type="button"
						className={styles['x-circle']}
						onClick={handleClickXCircle}
						aria-label="Закрыть модальное окно"
						data-testid={modalTestIds.modalCloseIcon}
					>
						<Icon icon="closeCircle" color={closeIconColors[variant]} aria-hidden="true" />
					</button>
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
