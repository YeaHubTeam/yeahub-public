'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useTranslation } from 'react-i18next';

import { Languages } from '@/shared/config/i18n/Translations';

/*
	Тестовый компонент для проверки смены языка
*/

export const LanguageSwitcher = () => {
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { t } = useTranslation();

	//TODO: перепиать на redux toolkit query
	const handleChangeLanguage = async (lang: Languages) => {
		if (loading) return;
		setLoading(true);
		await fetch('/api/set-locale', {
			method: 'POST',
			body: JSON.stringify({ locale: lang }),
			headers: { 'Content-Type': 'application/json' },
		});
		router.refresh();
		setLoading(false);
	};

	const handleEnClick = () => {
		void handleChangeLanguage(Languages.EN);
	};

	const handleRuClick = () => {
		void handleChangeLanguage(Languages.RU);
	};

	return (
		<div>
			<button onClick={handleEnClick} disabled={loading}>
				{t(Languages.EN)}
			</button>
			<button onClick={handleRuClick} disabled={loading}>
				{t(Languages.RU)}
			</button>
		</div>
	);
};
