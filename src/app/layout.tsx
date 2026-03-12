import React from 'react';

import Script from 'next/script';

import { getLocale } from 'next-intl/server';

import './globals.css';

const YANDEX_METRIKA_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || '98674727';

const RootLayout: React.FC<{ children: React.ReactNode }> = async ({ children }) => {
	const locale = await getLocale();

	return (
		<html lang={locale}>
			<body>
				{children}
				<Script id="yandex-metrika" strategy="afterInteractive">
					{`
						(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
						m[i].l=1*new Date();
						for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
						k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
						(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

						ym(${YANDEX_METRIKA_ID}, "init", {
							clickmap:true,
							trackLinks:true,
							accurateTrackBounce:true,
							webvisor:true
						});
					`}
				</Script>
			</body>
		</html>
	);
};

export default RootLayout;
