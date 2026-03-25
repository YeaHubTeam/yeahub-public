import Image from 'next/image';
import Link from 'next/link';

import { Chip } from '@/shared/ui/Chip';

import styles from './FilterChip.module.css';

interface FilterChipProps {
	src?: string | null;
	alt: string;
	url?: string;
}

export const FilterChip = ({ src, alt, url }: FilterChipProps) => {
	const renderCompany = (
		<Chip
			variant="big"
			className={styles.chip}
			label={alt}
			prefix={
				src ? (
					<Image
						src={src}
						alt={alt}
						width={40}
						height={40}
						style={{ borderRadius: '8px' }}
						loading="lazy"
					/>
				) : null
			}
		/>
	);

	if (url) {
		return <Link href={url}>{renderCompany}</Link>;
	}

	return renderCompany;
};
