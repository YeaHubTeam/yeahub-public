import Link from 'next/link';

import { ROUTES } from '@/shared/config';
import { SPEC_MAP, route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import { QuestionGradeList } from '../QuestionGradeList/QuestionGradeList';
import styles from './PreviewQuestionsItem.module.css';

interface PreviewQuestionsItemProps {
	title: string;
	specialization: keyof typeof SPEC_MAP;
	rate?: number;
	complexity?: number;
	imageSrc?: string;
	slug: string;
}

export const PreviewQuestionsItem = ({
	title,
	specialization,
	rate,
	complexity,
	imageSrc,
	slug,
}: PreviewQuestionsItemProps) => {
	const detailRoute = `${route(ROUTES.questions.detail.page, slug)}?specialization=${specialization}`;
	return (
		<li>
			<Card withOutsideShadow size="small">
				<Link href={detailRoute} className={styles.link}>
					{imageSrc && <ImageWithWrapper src={imageSrc} className={styles.image} />}
					<Flex direction="column" gap="8">
						<Text variant="body3-accent" maxRows={1} className={styles.title}>
							{title}
						</Text>
						<QuestionGradeList
							rate={rate || 0}
							complexity={complexity || 0}
							className={styles.params}
							size="small"
						/>
					</Flex>
				</Link>
			</Card>
		</li>
	);
};
