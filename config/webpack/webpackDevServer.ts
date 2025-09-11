import type { Configuration as DevServerConfiguration } from 'webpack-dev-server';

import { WebpackOptions } from './types/types';

export const webpackDevServer = ({ port }: WebpackOptions): DevServerConfiguration => {
	return {
		port: port ?? 3001,
		open: process.env.BROWSER
			? {
					app: {
						name: process.env.BROWSER,
					},
				}
			: true,
		historyApiFallback: true,
		hot: true,
		server: {
			type: 'http'
		},
	};
};
