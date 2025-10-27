import cn from 'classnames';
import 'highlight.js/styles/atom-one-dark.css';

import { CodeBlocksHydrator } from './CodeBlocksHydrator';
import './TextHtml.global.css';
import styles from './TextHtml.module.css';
import { processHtmlContent } from './processHtmlContent';

export interface TextHtmlProps {
	html: string;
	className?: string;
	disableCodeCopy?: boolean;
}

let idCounter = 0;

export const TextHtml = ({ className, html, disableCodeCopy = false }: TextHtmlProps) => {
	const { processedHtml, codeBlocks } = processHtmlContent(html);

	const containerId = `text-html-${idCounter++}`;

	return (
		<div id={containerId} className={cn(styles['text-html'], className)}>
			<div className={styles.content} dangerouslySetInnerHTML={{ __html: processedHtml }} />

			{!disableCodeCopy && codeBlocks.length > 0 && (
				<CodeBlocksHydrator codeBlocks={codeBlocks} containerId={containerId} />
			)}
		</div>
	);
};
