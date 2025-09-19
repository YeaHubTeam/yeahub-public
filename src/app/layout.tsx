import React from 'react';

import { getLocale } from 'next-intl/server';

import './globals.css';

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
	const locale = await getLocale();

	return (
		<html lang={locale}>
			<body>{children}</body>
		</html>
	);
};

export default RootLayout;
