import Image, { StaticImageData } from 'next/image';

import { Link, ROUTES } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './InfoBlock.module.css';

interface InfoBlockProps {
	image: StaticImageData;
	text: string;
	title: string;
	linkText: string;
}

export const InfoBlock = ({ image, title, text, linkText }: InfoBlockProps) => {
	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles['card-content']}>
			<Flex className={styles['info-block']} maxHeight>
				<Flex className={styles['info-block-main']} gap="20" direction="column" justify="between">
					<Indicator className={styles.indicator} variant="purple" />
					<Flex gap="8" direction="column">
						<Text variant="head3" color="black-900">
							{title}
						</Text>
						<Text variant="body3" color="black-900">
							{text}
						</Text>
						<Link href={ROUTES.quiz.new.page} className={styles.link}>
							{linkText}
							<Icon icon="arrowRight" size={24} />
						</Link>
					</Flex>
				</Flex>
				<Card className={styles['image-wrapper']} withOutsideShadow>
					<Image src={image} alt={title} className={styles.image} />
				</Card>
			</Flex>
		</Card>
	);
};
