import Image, { StaticImageData } from 'next/image';

import { AccordionMentor } from '@/shared/ui/AccordionMentor';
import { Text } from '@/shared/ui/Text';

import styles from './EducationStep.module.css';

interface EducationStepProps {
	id: string;
	title: string;
	description: string;
	image?: StaticImageData;
	imgAlt: string;
	mediaClassName?: string;
}

export const EducationStep = ({
	id,
	title,
	description,
	image,
	mediaClassName,
	imgAlt,
}: EducationStepProps) => {
	return (
		<div className={styles.step}>
			<AccordionMentor
				number={id}
				title={title}
				media={image && <Image src={image} alt={imgAlt} />}
				mediaClassName={mediaClassName}
				moveTitle
				defaultOpen
			>
				<Text variant="body3-accent">{description}</Text>
			</AccordionMentor>
		</div>
	);
};
