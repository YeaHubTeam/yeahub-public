/* global require, module */
const ts = require('typescript');
// Изолированный transform: не вызывает next/jest, loadEnvConfig или Next config.
module.exports = {
	process(sourceText, sourcePath) {
		return { code: ts.transpileModule(sourceText, {
			fileName: sourcePath,
			compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
		}).outputText };
	},
};
