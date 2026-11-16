import { useTranslations } from 'next-intl';

import type { ActiveProfile } from '@/entities/profile';
import { i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Text';
import { TextHtml } from '@/shared/ui/TextHtml';

import { ExpandableContent } from './ExpandableContent';
import styles from './ProfileAbout.module.css';

export interface ProfileAboutProps {
	description?: ActiveProfile['description'];
}

export const ProfileAbout = ({ description }: ProfileAboutProps) => {
	const t = useTranslations(i18Namespace.profile);

	return (
		<Card withOutsideShadow>
			<ExpandableContent>
				<div className={styles.content}>
					<div role="heading" aria-level={2}>
						<Text variant="body5-accent">{t('about.title')}</Text>
					</div>
					{description?.trim() ? (
						<TextHtml html={description} className={styles.description} disableCodeCopy />
					) : (
						<Text variant="body3-accent">{t('about.empty')}</Text>
					)}
				</div>
			</ExpandableContent>
		</Card>
	);
};
