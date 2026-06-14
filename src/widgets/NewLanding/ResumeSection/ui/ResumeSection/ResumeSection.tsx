import Image from 'next/image';

import { BeforAfter, CardVacancyOne, CardVacancyTwo, KeywordsContainer } from '@/shared/assets';
import { Button } from '@/shared/ui/Button';
import { Icon } from '@/shared/ui/Icon';

import IconFlash from '../IconFlash/IconFlash';
import Soon from '../Soon/Soon';
import styles from './ResumeSection.module.css';

export const ResumeSection = () => {
	return (
		<div className={styles.resume_wrapper}>
			<div className={styles.title_wrapper}>
				<h2 className={styles.title}>РЕЗЮМЕ И ПОИСК РАБОТЫ В IT</h2>
				<p className={styles.title_discript}>
					Подготовь резюме, оптимизируй его под ATS системы и находи реальные вакансии в IT
					компаниях.
				</p>
			</div>
			<div className={styles.cards_wrapper}>
				<div className={styles.card_wrap_resum}>
					<div className={styles.card_content_resum}>
						<div className={styles.beforAfter_wrap}>
							<Image src={BeforAfter} alt="befor-after-image" className={styles.beforAfter_img} />
							<div className={styles.soon_wrapper_resum}>
								<Soon />
							</div>
						</div>
						<div className={styles.description_wrapper}>
							<div className={styles.soon_wrapper_description}>
								<Soon />
							</div>
							<div className={styles.description_content}>
								<h3 className={styles.description_title}>ATS резюме</h3>
								<p className={styles.description_text}>
									Оптимизируй резюме под автоматические системы отбора, чтобы проходить фильтры
									компаний и получать больше откликов.
								</p>
								<Button
									className={styles.resume_buttonLink}
									variant="link-purple"
									size="large"
									preffix="Резюме"
									suffix={<Icon icon="arrowRight" size={24} />}
									disabled={true}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className={styles.card_wrap}>
					<div className={styles.card_content_keyWords}>
						<Image src={KeywordsContainer} alt="keywords-image" className={styles.keyWords_img} />
						<div className={styles.description_content}>
							<h3 className={styles.description_title}>Ключевые слова</h3>
							<p className={styles.description_text}>
								Извлекай ключевые навыки и формулировки из вакансий, чтобы адаптировать резюме под
								реальные требования работодателей.
							</p>
						</div>
					</div>
				</div>
				<div className={styles.card_wrap}>
					<div className={styles.card_content_vacansy}>
						<div className={styles.card_content_wrapper}>
							<div className={styles.icon_wrapper_one}>
								<div className={styles.iconFlash_vacancy_wrap}>
									<IconFlash />
								</div>
								<Soon />
							</div>
							<div className={styles.icon_wrapper_two}>
								<Image
									src={CardVacancyOne}
									alt="card-vacancy-image"
									className={styles.card_vacancy_imgOne}
								/>
								<Image
									src={CardVacancyTwo}
									alt="card-vacancy-image"
									className={styles.card_vacancy_imgTwo}
								/>
							</div>
						</div>

						<div className={styles.description_content}>
							<h3 className={styles.description_title}>Агрегатор вакансий</h3>
							<p className={styles.description_text}>
								Находи актуальные IT вакансии и стажировки в разных компаниях с удобным поиском и
								фильтрацией.
							</p>
							<Button
								className={styles.vacancy_buttonLink}
								variant="link-purple"
								size="large"
								preffix="Вакансии"
								suffix={<Icon icon="arrowRight" size={24} />}
								disabled={true}
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
