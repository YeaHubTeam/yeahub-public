'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { createPortal } from 'react-dom';

import CloseIcon from '@/shared/assets/icons/closeCircle.svg';

import styles from './Drawer.module.css';

export const drawerTestIds = {
	container: 'drawer-container',
	closeBtnBackdrop: 'close-backdrop',
	drawer: 'drawer',
	drawerHeader: 'drawer-header',
};

export interface DrawerProps {
	isOpen: boolean;
	position?: 'right' | 'left' | 'bottom';
	onClose: () => void;
	children: React.ReactNode;
	className?: string;
	hasCloseButton?: boolean;
	withBackdrop?: boolean;
}

// const createPortalRoot = () => {
// 	const drawerRoot = document.createElement('div');
// 	drawerRoot.setAttribute('id', 'drawer-root');
//
// 	return drawerRoot;
// };

export const Drawer = ({
	isOpen,
	children,
	position = 'right',
	onClose,
	className,
	hasCloseButton = false,
	withBackdrop = true,
}: DrawerProps) => {
	const portalRootRef = useRef<HTMLElement | null>(null);
	const renderRootRef = useRef<HTMLElement | null>(null);
	const drawerRef = useRef<HTMLDivElement>(null);
	const [isRender, setIsRender] = useState(false);
	const rootEl = renderRootRef.current;

	useEffect(() => {
		portalRootRef.current = document.getElementById('drawer-root');
		renderRootRef.current = document.querySelector('body');
		setIsRender(true);

		return () => {
			portalRootRef.current = null;
			renderRootRef.current = null;
			setIsRender(false);
		};
	}, []);

	useEffect(() => {
		if (rootEl && withBackdrop) {
			rootEl.style.overflow = isOpen ? 'hidden' : '';

			return () => {
				rootEl.style.overflow = '';
			};
		}
	}, [isOpen, isRender, rootEl, withBackdrop]);

	useEffect(() => {
		if (isOpen && rootEl && portalRootRef.current) {
			rootEl.appendChild(portalRootRef.current);
			// const portal = portalRootRef.current;

			return () => {
				// portal.remove();
				if (withBackdrop) rootEl.style.overflow = '';
			};
		}
	}, [isOpen, rootEl, withBackdrop]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === 'Escape') {
			onClose();
		}
	};

	const handleClickOutside = useCallback(
		(event: MouseEvent) => {
			if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
				onClose();
			}
		},
		[onClose],
	);

	useEffect(() => {
		if (!isOpen || withBackdrop) return;

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, withBackdrop, handleClickOutside]);
	if (!isRender || !portalRootRef.current) return null;

	return createPortal(
		<div
			aria-hidden={isOpen}
			data-testid={drawerTestIds.container}
			className={classNames(styles['drawer-container'], {
				[styles['open']]: isOpen,
			})}
		>
			<div
				ref={drawerRef}
				data-testid={drawerTestIds.drawer}
				className={classNames(styles['drawer'], styles[position], className)}
				role="dialog"
			>
				{hasCloseButton && (
					<div data-testid={drawerTestIds.drawerHeader} className={styles['drawer-header']}>
						<CloseIcon className={styles['close-icon']} onClick={onClose} />
					</div>
				)}
				{children}
			</div>
			{withBackdrop && (
				<button
					data-testid={drawerTestIds.closeBtnBackdrop}
					className={styles['backdrop']}
					onClick={onClose}
					onKeyDown={handleKeyDown}
				/>
			)}
		</div>,
		portalRootRef.current,
	);
};
