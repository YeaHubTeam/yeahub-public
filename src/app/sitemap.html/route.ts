import { NextResponse } from 'next/server';

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const getSiteBaseUrl = (): string => {
	return (process.env.NEXT_PUBLIC_SITE_URL || 'https://yeahub.ru').replace(/\/$/, '');
};

const getHostname = (baseUrl: string): string => {
	try {
		return new URL(baseUrl).hostname;
	} catch {
		return 'yeahub.ru';
	}
};

export const GET = () => {
	const baseUrl = getSiteBaseUrl();
	const sitemapXmlUrl = `${baseUrl}/sitemap.xml`;
	const siteHostname = getHostname(baseUrl);

	const templatePath = join(process.cwd(), 'src/app/sitemap.html/template.html');
	let html = readFileSync(templatePath, 'utf8');
	html = html.replaceAll('__SITE_HOSTNAME__', siteHostname);
	html = html.replaceAll('__SITEMAP_XML_JSON__', JSON.stringify(sitemapXmlUrl));

	return new NextResponse(html, {
		headers: { 'Content-Type': 'text/html; charset=utf-8' },
	});
};
