import Link from 'next/link';

import { ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import { QuestionGradeList } from '../QuestionGradeList/QuestionGradeList';
import styles from './PreviewQuestionsItem.module.css';

interface PreviewQuestionsItemProps {
	title: string;
	specialization: string;
	rate?: number;
	complexity?: number;
	imageSrc?: string;
	slug: string;
	locale: string;
}

export const PreviewQuestionsItem = ({
	title,
	specialization,
	rate,
	complexity,
	imageSrc,
	slug,
	locale,
}: PreviewQuestionsItemProps) => {
	const detailRoute = route(ROUTES.questions.detail.page, locale, specialization, slug);
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
