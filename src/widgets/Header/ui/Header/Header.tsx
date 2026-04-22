// import { LanguageSwitcher } from '@/features/switch-language';
import { AppLogo } from '@/shared/ui/AppLogo';
import { Flex } from '@/shared/ui/Flex';

import { HeaderAuth } from '../HeaderAuth/HeaderAuth';
import { HeaderNav } from '../HeaderNav/HeaderNav';
import styles from './Header.module.css';

export const Header = () => {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'SiteNavigationElement',
		name: ['База вопросов', 'Тренажёр', 'Собеседования', 'Курсы', 'Менторы', 'Резюме'],

		url: [
			'/ru/questions/react-frontend-developer',
			'/ru/collections/react-frontend-developer',
			'/ru/quiz/new',
			'/ru/resources/react-frontend-developer',
			'/ru/learning',
			'/ru/hh-analytics',
		],
	};

	return (
		<header data-testid={'Header'} className={styles.header}>
			<Flex className={styles['header-content']}>
				<Flex className={styles['header-main']}>
					<AppLogo />
					<HeaderNav />
				</Flex>
				<Flex align="center" gap="16">
					{/*<LanguageSwitcher />*/}
					<HeaderAuth />
				</Flex>
			</Flex>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
			/>
		</header>
	);
};
