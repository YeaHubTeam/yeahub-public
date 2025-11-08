import Image from 'next/image';

import classNames from 'classnames';

import EmptyStub from '@/shared/assets/icons/EmptyStub.svg';

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
		imageToRender = (
			<Image width={100} height={100} className={styles.image} src={src} alt={alt} loading="lazy" />
		);
	}

	return <div className={classNames(styles.wrapper, className)}>{imageToRender}</div>;
};
