'use client';

import { useState } from 'react';

import Image from 'next/image';

import EmptyStub from '@/shared/assets/icons/EmptyStub.svg';

import styles from './ImageWithWrapper.module.css';

interface ImageWithErrorHandlingProps {
	src: string;
	alt: string;
}

export const ImageWithErrorHandling = ({ src, alt }: ImageWithErrorHandlingProps) => {
	const [isError, setIsError] = useState(false);

	if (isError) {
		return <EmptyStub className={styles.svg} />;
	}

	return (
		<Image
			width={100}
			height={100}
			className={styles.image}
			src={src}
			alt={alt}
			loading="lazy"
			onError={() => setIsError(true)}
		/>
	);
};
