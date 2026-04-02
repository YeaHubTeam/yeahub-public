'use client';

import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './StrategyBlockHeader.module.css';

export const StrategyBlockHeader = () => {
	const { isMobile } = useScreenSize();

	return (
		<div className={styles['strategy-block-wrapper']}>
			<div className={styles['strategy-block-header']}>
				<Flex align="center" gap={isMobile ? '8' : '16'} className={styles['indicator-wrapper']}>
					<span className={styles['indicator']}></span>
					<span>стратегия</span>
				</Flex>
				<Flex direction="column" gap="10">
					<Text
						variant={isMobile ? 'body5-accent' : 'head3'}
						width={isMobile ? 340 : ''}
						className={styles.title}
					>
						Мы не ждём хороший рынок. Мы побеждаем на любом.
					</Text>
					<Text variant="body3-accent" width={isMobile ? 340 : 487}>
						Поиск работы — это отдельный навык, который требует активных действий.
					</Text>
				</Flex>
			</div>
		</div>
	);
};
