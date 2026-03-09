import Link from 'next/link';

import classnames from 'classnames';
import { useTranslations } from 'next-intl';

import Question from '@/shared/assets/icons/collectionsQuestion.svg';
import Star from '@/shared/assets/icons/starsMinimalistic.svg';
import { Collections, ROUTES, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { StatusChip } from '@/shared/ui/StatusChip';
import { Text } from '@/shared/ui/Text';

import type { Collection } from '../../model/types/collection';
import styles from './CollectionPreview.module.css';

const MAX_LIMIT_KEYWORDS = 4;

type CollectionProps = {
	collection: Collection;
	specialization: string;
	variant?: 'row' | 'column';
};

export const CollectionPreview = ({
	collection,
	specialization,
	variant = 'row',
}: CollectionProps) => {
	const { title, isFree, imageSrc, questionsCount, keywords, specializations, company, slug } =
		collection;

	const t = useTranslations(i18Namespace.collection);

	const accessText = {
		free: t(Collections.TARIFF_FREE, { ns: i18Namespace.collection }),
		paid: t(Collections.TARIFF_PAID, { ns: i18Namespace.collection }),
	};

	const collectionPath = route(ROUTES.collections.detail.page, specialization, slug);

	return (
		<Link href={collectionPath}>
			<Card withOutsideShadow className={styles.content}>
				<div className={classnames(styles.wrapper, styles[variant])}>
					<ImageWithWrapper
						src={imageSrc || company?.imageSrc}
						alt={t(Collections.IMAGE_ALT)}
						className={classnames(styles['image-wrapper'], styles[variant])}
					/>
					<Flex direction="column" gap="16">
						<div className={styles.header}>
							<ul className={styles.tags}>
								{keywords?.map(
									(keyword, index) =>
										index < MAX_LIMIT_KEYWORDS && (
											<li key={keyword}>
												<StatusChip key={keyword} status={{ text: keyword, variant: 'green' }} />
											</li>
										),
								)}
							</ul>
						</div>
						<Flex direction="column" gap="20">
							<Text
								className={classnames(styles['card-title'], styles[variant])}
								variant="body3-accent"
								maxRows={2}
							>
								{title}
							</Text>
							<div className={styles['access-container']}>
								<div className={styles['access-item']}>
									{!isFree && <Star />}
									<Text variant="body2" color="purple-700">
										{accessText[isFree ? 'free' : 'paid']}
									</Text>
								</div>
								{!!questionsCount && (
									<div className={styles['access-item']}>
										<Question />
										<Text variant="body2" color="purple-700">
											{t(Collections.QUESTIONS_COUNT, {
												count: questionsCount,
											})}
										</Text>
									</div>
								)}
							</div>
							<div className={styles['specialization-container']}>
								{specializations?.map((spec) => (
									<Text variant="body3-accent" key={spec.id}>
										{spec.title}
									</Text>
								))}
							</div>
						</Flex>
					</Flex>
				</div>
			</Card>
		</Link>
	);
};
