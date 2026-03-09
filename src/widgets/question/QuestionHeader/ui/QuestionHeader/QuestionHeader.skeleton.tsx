import React from 'react';

import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapperSkeleton } from '@/shared/ui/ImageWithWrapper';
import { TextSkeleton } from '@/shared/ui/Text';

import styles from './QuestionHeader.module.css';

export const QuestionHeaderSkeleton = () => {
	return (
		<Card withOutsideShadow className={styles.header}>
			<Flex gap="10" direction="row">
				<ImageWithWrapperSkeleton className={styles['image-default']} />
				<Flex direction="column" gap="8" maxWidth>
					<Flex justify="between" align="start" gap="8" maxWidth>
						<TextSkeleton width="100%" variant="body6" isMainTitle className={styles.title} />
					</Flex>
					<TextSkeleton width="100%" variant="body3-accent" color="black-800" />
				</Flex>
			</Flex>
		</Card>
	);
};
