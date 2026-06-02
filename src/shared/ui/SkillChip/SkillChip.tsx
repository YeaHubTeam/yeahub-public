import classNames from 'classnames';

import { Flex } from '../Flex';
import styles from './SkillChip.module.css';

interface SkillChipProps {
	label: string;
	dataTestId?: string;
	className?: string;
}
export const SkillChip = ({ label, dataTestId, className }: SkillChipProps) => {
	return (
		<Flex className={classNames(styles.skill, className)} dataTestId={dataTestId}>
			{label}
		</Flex>
	);
};
