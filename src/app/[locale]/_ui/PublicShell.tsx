import React from 'react';

import { getHeaderProfile } from '@/auth';
import { Footer } from '@/widgets/Footer';
import { Header } from '@/widgets/Header';

import styles from '../layout.module.css';

export const PublicShell = ({ children }: { children: React.ReactNode }) => {
	async function loadHeaderProfileAction() {
		'use server';
		try {
			return await getHeaderProfile();
		} catch {
			return { status: 'error' } as const;
		}
	}
	return (
		<>
			<Header loadHeaderProfileAction={loadHeaderProfileAction} />
			<main className={styles.main}>
				<div className={styles['main-content']}>{children}</div>
			</main>
			<Footer />
		</>
	);
};
