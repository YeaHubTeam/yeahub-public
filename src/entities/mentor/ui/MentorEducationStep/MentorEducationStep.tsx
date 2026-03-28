import Image, { StaticImageData } from 'next/image';

import { Accordion } from '@/shared/ui/Accordion';
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
			<Accordion
				title={title}
				moveTitle
				titleVariant="body6"
				variant="mentor"
				number={id}
				fixedHeight
				limitContent
				defaultOpen
				media={image && <Image src={image} alt={title} />}
				mediaClassName={mediaClassName}
			>
				<Text variant="body3-accent">{description}</Text>
			</Accordion>
		</div>
	);
};
