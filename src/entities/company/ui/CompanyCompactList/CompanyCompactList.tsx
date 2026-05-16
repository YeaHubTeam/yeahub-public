import Image from 'next/image';

import { Flex } from '@/shared/ui/Flex';
import { Tooltip } from '@/shared/ui/Tooltip';

import { Company } from '../../@x/collection';
import styles from './CompanyCompactList.module.css';

interface CompanyCompactListProps {
	companies: Company[];
}

export const CompanyCompactList = ({ companies }: CompanyCompactListProps) => {
	const companiesTitles = companies.map((company) => company.title).join(', ');

	return (
		<Tooltip title={companiesTitles}>
			<Flex align="center" justify="center" gap="10" className={styles.list}>
				{companies.map((company) => (
					<Image
						className={styles.image}
						key={company.id}
						src={company.imageSrc || ''}
						alt={company.title}
						width={19}
						height={19}
					/>
				))}
			</Flex>
		</Tooltip>
	);
};
