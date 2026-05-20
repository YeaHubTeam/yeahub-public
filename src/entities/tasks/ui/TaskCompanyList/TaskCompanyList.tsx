import { Flex } from '@/shared/ui/Flex';
import { ImageWithWrapper } from '@/shared/ui/ImageWithWrapper';
import { Tooltip } from '@/shared/ui/Tooltip';

import { TaskCompany } from '../../model/types/task';
import styles from './TaskCompanyList.module.css';

interface TaskCompanyListProps {
	companies: TaskCompany[];
}

export const TaskCompanyList = ({ companies }: TaskCompanyListProps) => {
	if (!companies.length) return null;

	const companiesTitles = companies.map((company) => company.title).join(', ');

	return (
		<Tooltip title={companiesTitles}>
			<Flex align="center" justify="center" gap="10" className={styles.list}>
				{companies.map((company) => (
					<ImageWithWrapper
						key={company.id}
						src={company.imageSrc ?? undefined}
						alt={company.title}
						className={styles.image}
					/>
				))}
			</Flex>
		</Tooltip>
	);
};
