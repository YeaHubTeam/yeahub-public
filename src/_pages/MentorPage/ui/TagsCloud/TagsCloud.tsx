import React from 'react';

import { useTranslations } from 'next-intl';

import { i18Namespace } from '@/shared/config';
import { Chip } from '@/shared/ui/Chip';
import { Slider } from '@/shared/ui/Slider';

import styles from './TagsCloud.module.css';
import { tagsCloudSliderSettings } from './constants/constanst';
import { tagsCloudList } from './constants/constanst';

export const TagsCloud = () => {
	const t = useTranslations(i18Namespace.mentor);
	return (
		<section data-testid="TagsCloud" className={styles.list}>
			<Slider {...tagsCloudSliderSettings} className={styles['slider-container-tags-cloud']}>
				{tagsCloudList.map(({ id, title }) => (
					<Chip key={id} label={t(title)} className={styles.chip} />
				))}
			</Slider>
		</section>
	);
};
