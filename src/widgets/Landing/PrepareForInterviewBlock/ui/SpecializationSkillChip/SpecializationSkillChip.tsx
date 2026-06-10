import { Flex } from '@/shared/ui/Flex';

import styles from './SpecializationSkillChip.module.css';

interface SpecializationSkillChipProps {
	key: number | string;
	label: string;
}

export const SpecializationSkillChip = ({ key, label }: SpecializationSkillChipProps) => {
	return (
		<Flex align="center" key={key} className={styles.chip}>
			{label}
		</Flex>
	);
};
