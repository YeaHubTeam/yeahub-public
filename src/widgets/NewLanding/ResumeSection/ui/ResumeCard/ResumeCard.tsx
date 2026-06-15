import Image from 'next/image';

import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { NewLanding, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon/Icon';
import { Text } from '@/shared/ui/Text';

import { ResumeCardProps } from '../../model/types/resumeTypes';
import IconFlash from '../IconFlash/IconFlash';
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
	const t = useTranslations(i18Namespace.newLanding);
	return (
		<Flex
			className={classNames(styles.card_wrap, styles[`card_wrap-${id}`])}
			direction="column"
			justify="between"
		>
			<Flex direction="column" justify="center">
				{iconFlash && <IconFlash />}
				{soon && (
					<Text
						variant="body5-accent"
						color="white-900"
						className={classNames(styles.soon_text, styles[`soon_text-${id}`])}
					>
						{t(NewLanding.SOON_TEXT)}
					</Text>
				)}
				<Flex
					className={classNames(styles.img_container, styles[`img_container-${id}`])}
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
			</Flex>
			<Flex
				className={classNames(styles.card_content, styles[`card_content-${id}`])}
				direction="column"
				justify="start"
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
						className={classNames(styles.buttonLink, styles[`buttonLink-${id}`])}
						variant="link-purple"
						size="large"
						suffix={<Icon icon="arrowRight" size={24} />}
						disabled={disabled}
					>
						{linkText}
					</Button>
				)}
			</Flex>
		</Flex>
	);
};

export default ResumeCard;
