import Image, { StaticImageData } from 'next/image';

import { Chip } from '@/shared/ui/Chip';

import styles from './SpecializationChip.module.css';

interface SkillChipProps {
	src: string | StaticImageData;
	alt: string;
}

export const SpecializationChip = ({ src, alt }: SkillChipProps) => {
	return (
		<Chip
			variant="big"
			className={styles.chip}
			label={alt}
			prefix={<Image width={34} height={34} src={src} alt={alt} loading="lazy" />}
		/>
	);
};
