import Image, { StaticImageData } from 'next/image';

import { AccordionMentor } from '@/shared/ui/AccordionMentor';
import { Text } from '@/shared/ui/Text';

import styles from './MentorEducationStep.module.css';

interface MentorEducationStepProps {
	id: string;
	title: string;
	description: string;
	image?: StaticImageData;
	mediaClassName?: string;
}

export const MentorEducationStep = ({
	id,
	title,
	description,
	image,
	mediaClassName,
}: MentorEducationStepProps) => {
	return (
		<div className={styles.step}>
			<AccordionMentor
				number={id}
				title={title}
				media={image && <Image src={image} alt={title} />}
				mediaClassName={mediaClassName}
				moveTitle
			>
				<Text variant="body3-accent">{description}</Text>
			</AccordionMentor>
		</div>
	);
};
