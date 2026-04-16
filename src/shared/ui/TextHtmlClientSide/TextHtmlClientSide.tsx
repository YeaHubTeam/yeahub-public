'use client';

import { useEffect, useId, useState } from 'react';

import cn from 'classnames';
import 'highlight.js/styles/atom-one-dark.css';

import '../TextHtml/TextHtml.global.css';
import { CodeBlocksHydratorClient } from './CodeBlocksHydratorClient';
import styles from './TextHtmlClientSide.module.css';
import { type ProcessedCodeBlock, processHtmlContentClient } from './processHtmlContentClient';

export interface TextHtmlClientSideProps {
	html: string;
	className?: string;
	disableCodeCopy?: boolean;
}

export const TextHtmlClientSide = ({
	className,
	html,
	disableCodeCopy = false,
}: TextHtmlClientSideProps) => {
	const reactId = useId();
	const containerId = `text-html-client-${reactId.replace(/:/g, '')}`;
	const [processed, setProcessed] = useState<{
		processedHtml: string;
		codeBlocks: ProcessedCodeBlock[];
	} | null>(null);

	useEffect(() => {
		setProcessed(processHtmlContentClient(html));
	}, [html]);

	return (
		<div id={containerId} className={cn(styles['text-html'], className)}>
			<div
				className={styles.content}
				dangerouslySetInnerHTML={{ __html: processed?.processedHtml ?? '' }}
			/>

			{!disableCodeCopy && processed && processed.codeBlocks.length > 0 && (
				<CodeBlocksHydratorClient codeBlocks={processed.codeBlocks} containerId={containerId} />
			)}
		</div>
	);
};
