import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Configuration } from 'webpack';

import { WebpackMode, WebpackOptions, WebpackPaths } from './config/webpack/types/types';
import { webpackConfig } from './config/webpack/webpackConfig';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface EnvVariables {
	mode: WebpackMode;
	port?: number | string;
}

const modes = {
	production: '.env.production',
	development: '.env.development',
	test: '.env.test',
};

export default (env: EnvVariables) => {
	const paths: WebpackPaths = {
		html: path.resolve(__dirname, 'public', 'index.html'),
		output: path.resolve(__dirname, 'build'),
		entry: path.resolve(__dirname, 'src', 'app', 'layout.tsx'),
		initTheme: path.resolve(
			__dirname,
			'src',
			'features',
			'theme',
			'switch-theme',
			'utils',
			'initTheme.ts',
		),
		src: path.resolve(__dirname, 'src'),
		public: path.resolve(__dirname, 'public'),
		env: path.resolve(__dirname, modes[env.mode]),
		locales: path.resolve(__dirname, 'public', 'locales'),
		buildLocales: path.resolve(__dirname, 'build', 'locales'),
	};

	// Пытаемся загрузить .env файл, если он существует
	try {
		dotenv.config({ path: paths.env });
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		// eslint-disable-next-line no-console
		console.warn(`Warning: .env file not found for ${env.mode} mode. Using process.env values.`);
	}

	const isDev = env.mode === 'development';
	const port = env.port ?? process.env.PORT ?? 3001;

	// Добавляем DefinePlugin для передачи переменных окружения в приложение
	const envVars = {
		__IS_DEV__: JSON.stringify(isDev),
		'process.env.NODE_ENV': JSON.stringify(env.mode),
		'process.env.PORT': JSON.stringify(process.env.PORT || port),
		'process.env.API_URL': JSON.stringify(process.env.API_URL),
		'process.env.LANDING_URL': JSON.stringify(process.env.LANDING_URL),
		'process.env.TELEGRAM_BOT_NAME': JSON.stringify(process.env.TELEGRAM_BOT_NAME),
	};

	const options: WebpackOptions = {
		port: +port,
		mode: env.mode,
		isDev,
		paths,
		envs: envVars,
	};

	const config: Configuration = webpackConfig(options);

	return config;
};
