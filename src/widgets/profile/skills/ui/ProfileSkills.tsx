import Image from 'next/image';

import { useTranslations } from 'next-intl';

import type { ActiveProfile } from '@/entities/profile';
import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';

import styles from './ProfileSkills.module.css';

export interface ProfileSkillsProps {
	skillsList?: ActiveProfile['profileSkills'] | null;
}

const imageUrl = (value: string | null): string | null => {
	try {
		const url = new URL(value ?? '');
		return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password
			? url.href
			: null;
	} catch {
		return null;
	}
};

export const ProfileSkills = ({ skillsList }: ProfileSkillsProps) => {
	const t = useTranslations(i18Namespace.profile);

	return (
		<Card withOutsideShadow>
			<div className={styles.content}>
				<div role="heading" aria-level={2}>
					<Text variant="body5-accent">{t('skills.title')}</Text>
				</div>
				{skillsList?.length ? (
					<ul className={styles.list}>
						{skillsList.map((skill) => {
							const image = imageUrl(skill.imageSrc);
							return (
								<li key={skill.id} className={styles.skill}>
									{image && (
										<Image
											src={image}
											alt=""
											width={20}
											height={20}
											unoptimized
											className={styles.icon}
										/>
									)}
									<Text variant="body3-accent" className={styles.name}>
										{skill.title}
									</Text>
								</li>
							);
						})}
					</ul>
				) : (
					<Text variant="body3">{t('skills.empty')}</Text>
				)}
			</div>
		</Card>
	);
};
