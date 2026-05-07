import Image from 'next/image';

import { Flex } from '@/shared/ui/Flex';
import { Tooltip } from '@/shared/ui/Tooltip';

import { ProgrammingLanguage } from '../../model/types/programmingLanguage';
import styles from './ProgrammingLanguageList.module.css';

interface ProgrammingLanguageListProps {
	supportedLanguages: ProgrammingLanguage[];
}

export const ProgrammingLanguageList = ({ supportedLanguages }: ProgrammingLanguageListProps) => {
	const languagesTitles = supportedLanguages.map((language) => language.name).join(', ');

	return (
		<Tooltip title={languagesTitles}>
			<Flex align="center" justify="center" gap="10" className={styles.list}>
				{supportedLanguages.map((language) => (
					<Image
						className={styles.image}
						key={language.id}
						src={language.imageSrc}
						alt={language.name}
						width={19}
						height={19}
					/>
				))}
			</Flex>
		</Tooltip>
	);
};
