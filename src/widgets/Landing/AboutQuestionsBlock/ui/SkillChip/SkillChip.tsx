import Image from 'next/image';
import Link from 'next/link';

import { Chip } from '@/shared/ui/Chip';

import styles from './SkillChip.module.css';

interface SkillChipProps {
	src?: string | null;
	alt: string;
	url?: string;
	showLabel?: boolean;
}

export const SkillChip = ({ src, alt, url, showLabel = false }: SkillChipProps) => {
	const imgSize = showLabel ? 34 : 36;

	const renderSkill = (
		<Chip
			variant="big"
			className={styles.chip}
			label={showLabel ? alt : ''}
			prefix={
				src ? <Image width={imgSize} height={imgSize} src={src} alt={alt} loading="lazy" /> : null
			}
		/>
	);

	if (url) {
		return <Link href={url}>{renderSkill}</Link>;
	}

	return renderSkill;
};
