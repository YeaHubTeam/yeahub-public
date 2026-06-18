'use client';

import { CSSProperties, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';

import styles from './CollapsibleChipGrid.module.css';

const CHIP_BIG_HEIGHT = 48;
const CHIP_GRID_GAP = 16;
const COLLAPSED_MAX_HEIGHT = CHIP_BIG_HEIGHT * 2 + CHIP_GRID_GAP;

interface CollapsibleChipGridProps {
	children: ReactNode;
}

export const CollapsibleChipGrid = ({ children }: CollapsibleChipGridProps) => {
	const t = useTranslations(i18Namespace.translation);
	const gridRef = useRef<HTMLDivElement>(null);
	const [isExpanded, setIsExpanded] = useState(false);
	const [isCollapsible, setIsCollapsible] = useState(false);
	const [contentHeight, setContentHeight] = useState(COLLAPSED_MAX_HEIGHT);

	const updateLayout = useCallback(() => {
		const grid = gridRef.current;
		if (!grid) return;

		const fullHeight = grid.scrollHeight;
		setContentHeight(fullHeight);
		setIsCollapsible(fullHeight > COLLAPSED_MAX_HEIGHT);
	}, []);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		updateLayout();

		const observer = new ResizeObserver(updateLayout);
		observer.observe(grid);

		return () => observer.disconnect();
	}, [children, updateLayout]);

	const onToggle = () => {
		updateLayout();
		setIsExpanded((prev) => !prev);
	};

	const maxHeight = isExpanded ? contentHeight : COLLAPSED_MAX_HEIGHT;

	return (
		<Flex direction="column" align="start" gap="8">
			<div
				ref={gridRef}
				className={classNames(styles.grid, {
					[styles.collapsible]: isCollapsible,
				})}
				style={
					{
						'--grid-max-height': isCollapsible ? `${maxHeight}px` : `${COLLAPSED_MAX_HEIGHT}px`,
					} as CSSProperties
				}
			>
				{children}
			</div>
			{isCollapsible && (
				<Button variant="link" onClick={onToggle}>
					{isExpanded ? t(Translation.HIDE) : t(Translation.SHOW_ALL)}
				</Button>
			)}
		</Flex>
	);
};
