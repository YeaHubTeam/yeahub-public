import { Company } from '@/entities/company';
import { ROUTES } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';
import { Slider } from '@/shared/ui/Slider';
import { skillsTickerSliderSettings } from '@/widgets/Landing/AboutQuestionsBlock/model/constants';

import { FilterChip } from '../FilterChip/FilterChip';
import styles from './FiltersBlock.module.css';

interface FiltersBlockProps {
	companies: Company[];
}

export const FiltersBlock = ({ companies }: FiltersBlockProps) => {
	return (
		<div data-testid="FiltersBlock" className={styles.list}>
			<Slider {...skillsTickerSliderSettings} className={styles['slider-container']}>
				{companies.map(({ id, imageSrc, title }) => (
					<FilterChip
						key={title}
						src={imageSrc}
						alt={title}
						url={`${route(ROUTES.collections.page, DEFAULT_SPECIALIZATION_SLUG)}?companies=${id}`}
					/>
				))}
			</Slider>
		</div>
	);
};
