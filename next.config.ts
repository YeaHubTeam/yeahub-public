import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';
import withSvgr from 'next-svgr';

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n/i18n.ts');

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.selstorage.ru',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'upload.wikimedia.org',
				pathname: '/**',
			},
		],
	},
	webpack: (config, { isServer }) => {
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				dns: false,
				http: false,
				https: false,
				stream: false,
				zlib: false,
				canvas: false,
			};

			config.externals = config.externals || [];
			config.externals.push({
				jsdom: 'commonjs jsdom',
				dompurify: 'commonjs dompurify',
			});
		}
		return config;
	},
};

export default withSvgr(withNextIntl(nextConfig));
