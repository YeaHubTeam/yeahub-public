declare module 'next-svgr' {
	import type { NextConfig } from 'next';
	export default function withSvgr(config: NextConfig): NextConfig;
}
