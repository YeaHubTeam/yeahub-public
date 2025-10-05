import React from 'react';

import { Text } from '@/shared/ui/Text';

import styles from './FooterCopyright.module.css';

export const FooterCopyright = () => {
	const currentYear = new Date().getFullYear();

	return (
		<Text
			dataTestId="FooterCopyright"
			className={styles.copyright}
			variant="body2-accent"
			color="black-400"
		>
			© {currentYear} YeaHub
		</Text>
	);
};
