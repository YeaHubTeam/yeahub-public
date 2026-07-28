import { useTranslations } from 'next-intl';

import { AUTH_LINKS, Landing, i18Namespace } from '@/shared/config';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import { StatisticList } from '../StatisticList/StatisticList';
import styles from './HeaderSection.module.css';

export const HeaderSection = () => {
	const t = useTranslations(i18Namespace.landing);

	return (
		<Flex direction="column" justify="between" className={styles.wrap}>
			<Flex direction="column" gap="24" align="center" className={styles.content}>
				<Flex direction="column" gap="8" align="center">
					<Text variant="head1" color="white-900" className={styles.title}>
						{t(Landing.HEADER_TITLE)}
					</Text>
					<Text variant="body3-accent" color="white-900" className={styles.subtitle}>
						{t(Landing.HEADER_SUBTITLE)}
					</Text>
				</Flex>
				<Button
					variant="link"
					size="large"
					className={styles.button}
					href={AUTH_LINKS.login}
					rel="noopener noreferrer"
					target="_blank"
				>
					{t(Landing.HEADER_BUTTON)}
				</Button>
			</Flex>
			<StatisticList />
		</Flex>
	);
};
