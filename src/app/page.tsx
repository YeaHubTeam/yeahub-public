import Image from 'next/image';

import { LanguageSwitcher } from '@/features/internationalization/switch-language';
import { detectLocale } from '@/shared/config/i18n/detectLocale';
import { getServerT } from '@/shared/config/i18n/i18nServer';

import styles from './page.module.css';

const Home = async () => {
	const locale = await detectLocale(); // 'ru' | 'en'
	const t = await getServerT(locale, 'translation');

	return (
		<div className={styles.page}>
			<main className={styles.main}>
				<Image
					className={styles.logo}
					src="/next.svg"
					alt="Next.js logo"
					width={180}
					height={38}
					priority
				/>

				<ol>
					<li>{t('edit')}</li>
					<li>{t('save')}</li>
				</ol>

				<p>{t('test')}</p>
				<LanguageSwitcher />
			</main>
		</div>
	);
};

export default Home;
