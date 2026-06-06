import { useTranslations } from 'next-intl';

import { gurus } from '@/entities/guru';
import { SpecializationGuruInfo } from '@/entities/specialization';
import { Link, ROUTES, Specializations, i18Namespace } from '@/shared/config';
import { route } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import styles from './GuruSection.module.css';

interface GuruSectionProps {
	specializationId: number;
}

export const GuruSection = ({ specializationId }: GuruSectionProps) => {
	const guru = gurus.find((g) => g.specializations.includes(specializationId));
	const t = useTranslations(i18Namespace.specialization);
	const avatarSize = 91;
	if (!guru) return null;
	const detail = specializationId === 11 ? route(ROUTES.mentor.page) : guru?.socials.landing;
	return (
		<Card className={styles.card} withOutsideShadow size="small">
			<Flex className={styles.wrapper} direction="row" justify="between" align="center">
				<SpecializationGuruInfo
					guru={guru}
					avatarSize={avatarSize}
					borderRadius={avatarSize / 2}
					avatarIcon={{ icon: 'tickWithBackground' }}
				/>
				<Flex className={styles.content} direction="row" justify="around" align="center">
					<Text variant="body3" color="black-800" className={styles.description}>
						{t(Specializations.GURU_DESCRIPTION)}
					</Text>

					{detail && (
						<Link href={detail} className={styles.link}>
							<Button
								variant="outline"
								className={styles['button']}
								size="medium"
								suffix={<Icon icon="arrowRight" color="purple-700" size={20} />}
							>
								<Text variant="body3-accent" color="purple-700" className={styles.text}>
									{t(Specializations.GURU_READ_MORE)}
								</Text>
							</Button>
						</Link>
					)}
				</Flex>
			</Flex>
		</Card>
	);
};
