import { Flex } from '@/shared/ui/Flex';

import styles from './Footer.module.css';
import { FooterMain } from './FooterMain/FooterMain';
import { FooterMeta } from './FooterMeta/FooterMeta';

export const Footer = () => {
	return (
		<footer data-testid="Footer" className={styles.footer}>
			<Flex dataTestId="Footer_Content" className={styles['footer-content']}>
				<FooterMain />
				<FooterMeta />
			</Flex>
		</footer>
	);
};
