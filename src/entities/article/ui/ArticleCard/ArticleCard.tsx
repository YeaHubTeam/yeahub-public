import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Articles, ROUTES, i18Namespace } from '@/shared/config';
import { formatDateDayMonth, route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Text } from '@/shared/ui/Text';

import { articleContentTypeMap } from '../../model/constants/article';
import type { Article } from '../../model/types/article';
import styles from './ArticleCard.module.css';

interface ArticleCardProps {
	article: Article;
	locale: string;
}

export const ArticleCard = ({ article, locale }: ArticleCardProps) => {
	const t = useTranslations(i18Namespace.articles);

	const { slug, title, excerpt, imageSrc, readingTimeMinutes, publishedAt, contentType } = article;

	const contentTypeLabel = contentType ? t(articleContentTypeMap[contentType]) : null;

	const formattedDate = publishedAt ? formatDateDayMonth(publishedAt, locale) : null;

	const articlePath = route(ROUTES.articles.detail.page, locale, slug);

	return (
		<Link href={articlePath}>
			<Card className={styles.card} withOutsideShadow>
				<Flex gap="20" className={styles.wrapper}>
					<ImageWithWrapper src={imageSrc || undefined} alt={title} className={styles.image} />

					<Flex direction="column" gap="16" flex={1}>
						<Flex align="center" gap="6" wrap="wrap">
							{contentTypeLabel && (
								<Text variant="body3" color="black-500" className={styles['meta-item']}>
									{contentTypeLabel}
								</Text>
							)}
							<Text variant="body3" color="black-500" className={styles['meta-item']}>
								{t(Articles.READING_TIME, { count: readingTimeMinutes })}
							</Text>
						</Flex>

						<Flex gap="8" direction="column">
							<Text variant="body3-accent" maxRows={2}>
								{title}
							</Text>

							<Text variant="body3" color="black-500" maxRows={4}>
								{excerpt}
							</Text>
						</Flex>

						<Text variant="body3" color="black-500">
							{formattedDate}
						</Text>
					</Flex>
				</Flex>
			</Card>
		</Link>
	);
};
