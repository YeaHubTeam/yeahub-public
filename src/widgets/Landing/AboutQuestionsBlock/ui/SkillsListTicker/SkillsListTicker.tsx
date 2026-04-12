import { Skill } from '@/entities/skill';
import { ROUTES } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';
import { Slider } from '@/shared/ui/Slider';

import { skillsTickerSliderSettings } from '../../model/constants';
import { SkillChip } from '../SkillChip/SkillChip';
import styles from './SkillsListTicker.module.css';

interface SkillsTListTickerProps {
	skills: Skill[];
	locale: string;
}

export const SkillsListTicker = ({ skills, locale }: SkillsTListTickerProps) => {
	return (
		<div className={`${styles.list} padding6`} data-testid="SkillsListTicker_List">
			<Slider {...skillsTickerSliderSettings} className={styles['slider-container']}>
				{skills.map(({ id, imageSrc, title, specializations }, index) => (
					<SkillChip
						key={index}
						src={imageSrc}
						url={`${locale}${route(ROUTES.questions.page, specializations[0]?.slug ?? DEFAULT_SPECIALIZATION_SLUG)}?skills=${id}`}
						alt={title}
						showLabel
					/>
				))}
			</Slider>
		</div>
	);
};
