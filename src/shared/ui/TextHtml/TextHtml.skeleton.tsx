import classNames from 'classnames';

import { TextSkeleton } from '@/shared/ui/Text';

import { TextHtmlProps } from './TextHtml';
import styles from './TextHtml.module.css';

export const TextHtmlSkeleton = ({ className }: Partial<TextHtmlProps>) => {
	return (
		<pre className={classNames(styles.text, className)}>
			<TextSkeleton variant="body3-accent" width="100%" />
		</pre>
	);
};
