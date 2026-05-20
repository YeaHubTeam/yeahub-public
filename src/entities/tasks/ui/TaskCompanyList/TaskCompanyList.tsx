import Image from 'next/image';

import { Flex } from '@/shared/ui/Flex';
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
				{companies.map((company) =>
					company.imageSrc ? (
						<Image
							className={styles.image}
							key={company.id}
							src={company.imageSrc}
							alt={company.title}
							width={19}
							height={19}
						/>
					) : (
						<span key={company.id} className={styles.fallback}>
							{company.title.slice(0, 1)}
						</span>
					),
				)}
			</Flex>
		</Tooltip>
	);
};
