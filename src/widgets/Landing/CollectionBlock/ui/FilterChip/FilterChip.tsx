import Image from 'next/image';

import { Chip } from '@/shared/ui/Chip';

import styles from './FilterChip.module.css';

interface FilterChipProps {
	src: string;
	alt: string;
}

export const FilterChip = ({ src, alt }: FilterChipProps) => {
	return (
		<Chip
			variant="big"
			className={styles.chip}
			label={alt}
			prefix={
				<Image
					src={src}
					alt={alt}
					width={40}
					height={40}
					style={{ borderRadius: '8px' }}
					loading="lazy"
				/>
			}
		/>
	);
};
