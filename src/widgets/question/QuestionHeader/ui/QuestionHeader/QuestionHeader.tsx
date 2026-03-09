import React from 'react';

import { Question, getQuestionImage } from '@/entities/question';
import { AdditionalInfoDrawer } from '@/shared/ui/AdditionalInfoDrawer';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';
import { QuestionAdditionalInfo } from '@/widgets/question/QuestionAdditionalInfo';

import styles from './QuestionHeader.module.css';

interface QuestionHeaderProps {
	question: Question;
}

export const QuestionHeader = ({ question }: QuestionHeaderProps) => {
	const { title, description } = question;
	const imagePriorityToShow = getQuestionImage(question);
	const { rate, keywords, complexity, questionSkills, questionSpecializations } = question;

	return (
		<Card withOutsideShadow className={styles.header}>
			<Flex gap="10" direction="row">
				<ImageWithWrapper className={styles['image-default']} src={imagePriorityToShow} />
				<Flex direction="column" gap="8" maxWidth>
					<Flex justify="between" align="start" gap="8" maxWidth>
						<Text variant="body6" color="black-800" isMainTitle className={styles.title}>
							{title}
						</Text>
						<AdditionalInfoDrawer>
							<QuestionAdditionalInfo
								className={styles['additional-info-wrapper']}
								rate={rate}
								keywords={keywords}
								complexity={complexity}
								questionSkills={questionSkills}
								questionSpecializations={questionSpecializations}
							/>
						</AdditionalInfoDrawer>
					</Flex>
					<Text variant="body3-accent" color="black-800">
						{description}
					</Text>
				</Flex>
			</Flex>
		</Card>
	);
};
