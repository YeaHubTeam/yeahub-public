import React from 'react';

import styles from './HeaderAuth.module.css';
import { HeaderAuthDesktop } from './HeaderAuthDesktop/HeaderAuthDesktop';
import { HeaderAuthMobile } from './HeaderAuthMobile/HeaderAuthMobile';

export const HeaderAuth = () => {
	return (
		<>
			<div className={styles['header-auth-desktop']}>
				<HeaderAuthDesktop />
			</div>
			<div className={styles['header-auth-mobile']}>
				<HeaderAuthMobile />
			</div>
		</>
	);
};
