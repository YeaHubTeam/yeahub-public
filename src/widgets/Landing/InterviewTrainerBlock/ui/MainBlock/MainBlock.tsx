import Image, { StaticImageData } from 'next/image';

import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './MainBlock.module.css';

interface MainBlockProps {
	questionImg: StaticImageData;
	text: string;
}

export const MainBlock = ({ questionImg, text }: MainBlockProps) => {
	return (
		<Flex gap="20" direction="column" className={styles['main-block']}>
			<div className={styles['image-wrapper']}>
				<Image
					className={styles['image']}
					src={questionImg}
					alt="quiz example"
					width={400}
					height={272}
				/>
			</div>
			<Text variant="body3" color="white-900">
				{text}
			</Text>
		</Flex>
	);
};
