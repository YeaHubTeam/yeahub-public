'use client';

import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';

import styles from './ProfileAbout.module.css';

export const ExpandableContent = ({ children }: { children: ReactNode }) => {
	const content = useRef<HTMLDivElement>(null);
	const id = useId();
	const [expanded, setExpanded] = useState(false);
	const [overflow, setOverflow] = useState(false);
	const t = useTranslations(i18Namespace.translation);

	useEffect(() => {
		const measure = () => {
			const exceeds = (content.current?.getBoundingClientRect().height ?? 0) >= 250;
			setOverflow(exceeds);
			if (!exceeds) setExpanded(false);
		};
		measure();
		const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
		if (content.current) observer?.observe(content.current);
		window.addEventListener('resize', measure);
		return () => {
			observer?.disconnect();
			window.removeEventListener('resize', measure);
		};
	}, [children]);

	return (
		<div className={styles.expandable}>
			<div id={id} className={overflow && !expanded ? styles.collapsed : undefined}>
				<div ref={content}>{children}</div>
			</div>
			{overflow && (
				<Button
					type="button"
					variant="tertiary-link"
					aria-expanded={expanded}
					aria-controls={id}
					onClick={() => setExpanded((value) => !value)}
				>
					{t(expanded ? Translation.HIDE : Translation.SHOW_ALL)}
				</Button>
			)}
		</div>
	);
};
