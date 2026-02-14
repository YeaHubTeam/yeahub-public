import Image, { StaticImageData } from 'next/image';

import { Chip } from '@/shared/ui/Chip';

import styles from './SkillChip.module.css';

interface SkillChipProps {
	src: string | StaticImageData;
	alt: string;
	showLabel?: boolean;
}

export const SkillChip = ({ src, alt, showLabel = false }: SkillChipProps) => {
	const imgSize = showLabel ? 34 : 36;

	return (
		<Chip
			variant="big"
			className={styles.chip}
			label={showLabel ? alt : ''}
			prefix={
				<Image style={{ width: imgSize, height: imgSize }} src={src} alt={alt} loading="lazy" />
			}
		/>
	);
};
