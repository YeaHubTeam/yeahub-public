import React from 'react';

import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import styles from '../layout.module.css';

export const PublicShell = ({ children }: { children: React.ReactNode }) => {
	return (
		<>
			<Header />
			<main className={styles.main}>
				<div className={styles['main-content']}>{children}</div>
			</main>
			<Footer />
		</>
	);
};
