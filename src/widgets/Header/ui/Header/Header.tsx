// import { LanguageSwitcher } from '@/features/switch-language';
import { AppLogo } from '@/shared/ui/AppLogo';
import { Flex } from '@/shared/ui/Flex';
import { HeaderTariffs } from '@/widgets/Header/ui/HeaderTariffs/HeaderTariffs';

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
				<Flex align="center" gap="16">
					{/*<LanguageSwitcher />*/}
					<HeaderTariffs />
					<HeaderAuth />
				</Flex>
			</Flex>
		</header>
	);
};
