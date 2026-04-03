import { Flex } from '@/shared/ui/Flex';

import { AdvantagesList } from '../AdvantagesList/AdvantagesList';
import FullPathStepper from '../FullPathStepper/FullPathStepper';
import MentorLandingSectionHeader from '../MentorLandingSectionHeader/MentorLandingSectionHeader';
import styles from './FullPath.module.css';

export const FullPath = () => {
	return (
		<section id={styles['full-path']}>
			<Flex direction="column" gap="20">
				<MentorLandingSectionHeader />
				<FullPathStepper />
				<AdvantagesList />
			</Flex>
		</section>
	);
};
