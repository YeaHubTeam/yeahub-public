/* global require, __dirname, process, console */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Тот же tsconfig, root files ограничены auth/public scope. Не меняет config и не загружает .env.
const root = path.resolve(__dirname, '../../..');
process.chdir(root);
const config = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
if (config.error) throw new Error('Не удалось прочитать tsconfig.json');
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
const files = ['next-env.d.ts', 'next.config.ts', 'src/shared/config/i18n/i18n.ts', 'src/app/[locale]/layout.tsx', 'src/proxy.ts'];
const walk = (directory) => {
	for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
		const filename = path.join(directory, entry.name);
		if (entry.isDirectory()) walk(filename);
		else if (/\.tsx?$/.test(filename)) files.push(filename);
	}
};
for (const directory of ['src/entities/session', 'src/features/authentication/login', 'src/features/authentication/register', 'src/features/authentication/recovery', 'src/features/authentication/telegram', 'src/app/api/auth', 'src/app/[locale]/auth', 'src/app/[locale]/(public)', 'src/widgets/AuthLayout']) walk(directory);
const program = ts.createProgram(files, { ...parsed.options, incremental: false, noEmit: true });
const diagnostics = [...parsed.errors, ...ts.getPreEmitDiagnostics(program)];
console.log(ts.formatDiagnostics(diagnostics, {
	getCanonicalFileName: (filename) => filename,
	getCurrentDirectory: () => root,
	getNewLine: () => '\n',
}));
console.log(`AUTH TypeScript: ${diagnostics.length} диагностик`);
process.exitCode = diagnostics.length ? 1 : 0;
