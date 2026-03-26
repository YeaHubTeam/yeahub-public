import { Flex } from '@/shared/ui/Flex';

import { TechItem } from '../../model/costants/mentorStackConstants';
import { MentorStackColumn } from '../MentorStackColumn/MentorStackColumn';
import styles from './MentorStackColumns.module.css';

interface MentorStackColumnsProps {
	mainTitle: string;
	mainRows: TechItem[][];
	advancedTitle: string;
	advancedRows: TechItem[][];
}

export const MentorStackColumns = ({
	mainTitle,
	mainRows,
	advancedTitle,
	advancedRows,
}: MentorStackColumnsProps) => {
	return (
		<Flex gap="40" className={styles['columns-wrapper']}>
			<MentorStackColumn title={mainTitle} rows={mainRows} />
			<MentorStackColumn title={advancedTitle} rows={advancedRows} />
		</Flex>
	);
};
