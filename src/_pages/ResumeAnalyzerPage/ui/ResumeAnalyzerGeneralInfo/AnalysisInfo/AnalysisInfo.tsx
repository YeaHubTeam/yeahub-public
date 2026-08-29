import Image from 'next/image';

import { useTranslations } from 'next-intl';

import { GrowthChart } from '@/shared/assets';
import { Vacancies, i18Namespace } from '@/shared/config';
import { Icon } from '@/shared/ui/Icon';

import styles from './AnalysisInfo.module.css';
import { ItemInfo } from './ItemInfo/ItemInfo';

export const AnalysisInfo = () => {
	const t = useTranslations(i18Namespace.vacancies);

	return (
		<div className={styles.container}>
			<ItemInfo
				icon={<Icon icon="uploadFile" color="purple-700" className={styles.img} />}
				title={t(Vacancies.RESUME_ANALYZER_INFO_TITLE)}
				value={t(Vacancies.RESUME_ANALYZER_INFO_FILE)}
				description={t(Vacancies.RESUME_ANALYZER_INFO_UPLOADED)}
				className={styles.item}
			/>
			<ItemInfo
				icon={<Image src={GrowthChart} alt="" className={styles.img} />}
				value={
					<>
						<span>{t(Vacancies.RESUME_ANALYZER_INFO_ANALYZED)}</span>
						<span>{t(Vacancies.RESUME_ANALYZER_INFO_COUNT)}</span>
					</>
				}
				description={t(Vacancies.RESUME_ANALYZER_INFO_UPDATED)}
				className={styles.item}
			/>
		</div>
	);
};
