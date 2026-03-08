'use client';

import { useEffect, useRef, useState } from 'react';

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
}: DrawerProps) => {
	const portalRootRef = useRef<HTMLElement | null>(null);
	const renderRootRef = useRef<HTMLElement | null>(null);
	const [isRender, setIsRender] = useState(false);
	const rootEl = renderRootRef.current;
	console.log(isRender);
	console.log('portalRootRef', portalRootRef);
	console.log('renderRootRef', renderRootRef);
	useEffect(() => {
		console.log('doc', document.getElementById('drawer-root'));
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
		if (rootEl) {
			rootEl.style.overflow = isOpen ? 'hidden' : '';

			return () => {
				rootEl.style.overflow = '';
			};
		}
	}, [isOpen, isRender, rootEl]);

	useEffect(() => {
		if (isOpen && rootEl && portalRootRef.current) {
			rootEl.appendChild(portalRootRef.current);
			// const portal = portalRootRef.current;

			return () => {
				// portal.remove();
				rootEl.style.overflow = '';
			};
		}
	}, [isOpen, rootEl]);

	const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
		if (event.key === 'Escape') {
			onClose();
		}
	};
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
			<button
				data-testid={drawerTestIds.closeBtnBackdrop}
				className={styles['backdrop']}
				onClick={onClose}
				onKeyDown={handleKeyDown}
			/>
		</div>,
		portalRootRef.current,
	);
};
