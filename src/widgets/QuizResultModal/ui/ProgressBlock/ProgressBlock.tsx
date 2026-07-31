import Image from 'next/image';

import { progressCard } from '../../model/assets';
import styles from './ProgressBlock.module.css';

export const ProgressBlock = () => {
	return (
		<div className={styles['image-wrapper']}>
			<Image className={styles['image']} src={progressCard} alt="progressCard" />
		</div>
	);
};
