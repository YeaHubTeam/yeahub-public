import classNames from 'classnames';

import EmptyStub from '@/shared/assets/icons/EmptyStub.svg';

import { ImageWithErrorHandling } from './ImageWithErrorHandling';
import styles from './ImageWithWrapper.module.css';

export interface ImageWithWrapperProps {
	className?: string;
	src?: string | null;
	alt?: string;
}

export const ImageWithWrapper = ({ className, src, alt = '' }: ImageWithWrapperProps) => {
	let imageToRender;

	if (!src) {
		imageToRender = <EmptyStub className={styles.svg} />;
	} else {
		imageToRender = <ImageWithErrorHandling src={src} alt={alt} />;
	}

	return <div className={classNames(styles.wrapper, className)}>{imageToRender}</div>;
};
