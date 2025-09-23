import type { NextConfig } from 'next';

import createNextIntlPlugin from 'next-intl/plugin';
import withSvgr from 'next-svgr';

const withNextIntl = createNextIntlPlugin('./src/shared/config/i18n.ts');

const nextConfig: NextConfig = {};

export default withSvgr(withNextIntl(nextConfig));
