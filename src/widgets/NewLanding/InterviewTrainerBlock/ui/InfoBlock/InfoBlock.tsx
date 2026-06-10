import Image, { StaticImageData } from 'next/image';

import RightArrow from '@/shared/assets/icons/arrowRight.svg';
import { Link } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import Circle from '../../model/assets/circle.svg';
import styles from './InfoBlock.module.css';

interface InfoBlockProps {
	image: StaticImageData;
	imageMobile?: StaticImageData;
	text: string;
	title: string;
	linkText: string;
}

export const InfoBlock = ({ image, imageMobile, title, text, linkText }: InfoBlockProps) => {
	return (
		<div className={styles['info-block-wrapper']}>
			<Flex style={{ height: '100%' }} direction="row" className={styles['info-block']}>
				<div className={styles['info-block-main-wrapper']}>
					<Flex className={styles['info-block-main']} gap="20" direction="column">
						<div className={styles['circle-wrapper']}>
							<Circle className={styles['circle']} />
						</div>
						<Flex gap="8" direction="column">
							<Text variant="head3" color="black-900">
								{title}
							</Text>
							<Text variant="body3" color="black-900">
								{text}
							</Text>
							<Link className={styles['link']} href={'/quiz/new'}>
								<Text variant="body3" color="purple-700">
									{linkText}
								</Text>
								<RightArrow className={styles['arrow']} />
							</Link>
						</Flex>
					</Flex>
				</div>

				<div className={styles['image-wrapper']}>
					{imageMobile ? (
						<>
							<Image src={image} alt={title} className={styles.desktop} />
							<Image src={imageMobile} alt={title} className={styles.mobile} />
						</>
					) : (
						<Image src={image} alt={title} className={styles.single} />
					)}
				</div>
			</Flex>
		</div>
	);
};
