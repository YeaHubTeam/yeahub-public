import { AppLogo } from '@/shared/ui/AppLogo';
import { Flex } from '@/shared/ui/Flex';

import { HeaderAuth } from '../HeaderAuth/HeaderAuth';
import { HeaderNav } from '../HeaderNav/HeaderNav';
import styles from './Header.module.css';

export const Header = () => {
	return (
		<header data-testid={'Header'} className={styles.header}>
			<Flex className={styles['header-content']}>
				<Flex className={styles['header-main']}>
					<AppLogo />
					<HeaderNav />
				</Flex>
				<HeaderAuth />
			</Flex>
		</header>
	);
};
