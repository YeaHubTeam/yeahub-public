import classNames from 'classnames';

import { useScreenSize } from '@/shared/libs';
import { TextSkeleton } from '@/shared/ui/Text';

import type { TextHtmlClientSideProps } from './TextHtmlClientSide';
import styles from './TextHtmlClientSide.module.css';

export const TextHtmlClientSideSkeleton = ({ className }: Partial<TextHtmlClientSideProps>) => {
	const { isMobile } = useScreenSize();

	return (
		<pre className={classNames(styles.text, className)}>
			<TextSkeleton variant={isMobile ? 'body2' : 'body3-accent'} width="100%" />
		</pre>
	);
};
