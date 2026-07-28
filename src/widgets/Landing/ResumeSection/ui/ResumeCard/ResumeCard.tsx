import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { Landing, i18Namespace } from '@/shared/config';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { ResumeCardProps } from '../../model/types/resumeTypes';
import styles from './ResumeCard.module.css';

const ResumeCard = ({
	id,
	title,
	description,
	images,
	to,
	linkText,
	disabled,
	iconFlash,
	soon,
}: ResumeCardProps) => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Card
			className={classNames(styles.card, styles[`card-${id}`])}
			contentClassName={styles['card-content']}
		>
			<Flex direction="column" justify="between" maxHeight className={styles.content}>
				{iconFlash && <Badge icon="lightning" variant="purple" wrapperClassName={styles.icon} />}
				{soon && (
					<Text
						variant="body5-accent"
						color="white-900"
						className={classNames(styles['soon-text'], styles[`soon-text-${id}`])}
					>
						{t(Landing.RESUME_SOON_TEXT)}
					</Text>
				)}
				<Flex
					className={classNames(styles['img-container'], styles[`img-container-${id}`])}
					justify="center"
				>
					{images.map((img) => (
						<Image
							key={img.id}
							src={img.src}
							alt={t(img.alt)}
							loading="lazy"
							className={classNames(styles.image, styles[`image-${img.id}`])}
						/>
					))}
				</Flex>
				<Flex
					className={classNames(styles['card-content'], styles[`card-content-${id}`])}
					direction="column"
					justify="end"
					gap="8"
				>
					<Text variant="head3" className={styles.title}>
						{title}
					</Text>
					<Text variant="body3" className={styles.description}>
						{description}
					</Text>
					{to && (
						<Button
							className={classNames(styles['button-link'], styles[`button-link-${id}`])}
							variant="link-purple"
							size="large"
							suffix={<Icon icon="arrowRight" size={24} />}
							disabled={disabled}
							href={to}
						>
							{linkText}
						</Button>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};

export default ResumeCard;
