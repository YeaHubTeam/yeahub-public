import Image, { StaticImageData } from 'next/image';

import classnames from 'classnames';
import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Indicator } from '@/shared/ui/Indicator';
import { Text } from '@/shared/ui/Text';

import styles from './ListItem.module.css';

interface ListItemProps {
	img: StaticImageData;
	imgClass: string;
	titleKey: string;
	descriptionKey: string;
	buttonKey: string;
	link: string;
}

export const ListItem = ({
	img,
	imgClass,
	titleKey,
	descriptionKey,
	buttonKey,
	link,
}: ListItemProps) => {
	const t = useTranslations(i18Namespace.landing);
	return (
		<div className={styles.card}>
			<Flex direction="column" justify="between" className={styles['card-content']}>
				<div className={classnames(styles['card-img'], styles[imgClass])}>
					<Image src={img} alt="interviewBanner" />
				</div>
				<Indicator variant="purple" className={styles.indicator} />
				<Flex direction="column" gap="20">
					<Flex gap="8" direction="column" className={styles.text}>
						<Text variant="head3" color="black-900" className={styles['card-title']}>
							{t(titleKey)}
						</Text>
						<Text variant="body3-accent" color="black-900">
							{t(descriptionKey)}
						</Text>
					</Flex>
					<Button variant="link" size="large" className={styles.link} href={link}>
						{t(buttonKey)}
					</Button>
				</Flex>
			</Flex>
		</div>
	);
};
