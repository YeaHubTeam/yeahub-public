import { TariffsButton } from '@/features/view-tariffs';
import { Flex } from '@/shared/ui/Flex';

import styles from './HeaderAuth.module.css';
import { HeaderAuthDesktop } from './HeaderAuthDesktop/HeaderAuthDesktop';
import { HeaderAuthMobile } from './HeaderAuthMobile/HeaderAuthMobile';

export const HeaderAuth = () => {
	return (
		<>
			<div className={styles['header-auth-desktop']}>
				<Flex align="center" gap="16">
					<TariffsButton />
					<HeaderAuthDesktop />
				</Flex>
			</div>
			<div className={styles['header-auth-mobile']}>
				<HeaderAuthMobile />
			</div>
		</>
	);
};
