import { useTranslations } from 'next-intl';

import type { Collection } from '@/entities/collection';
import {
	getGuruWithMatchingSpecialization,
	getNewGuruWithMatchingSpecialization,
} from '@/entities/guru';
import { Collections, Link, ROUTES, i18Namespace } from '@/shared/config';
import { BackButton } from '@/shared/ui/BackButton';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';
import { AdditionalInfo, CollectionBody, CollectionHeader } from '@/widgets/Collection';
import { SidebarBanner } from '@/widgets/Media';

import styles from './CollectionPage.module.css';

interface CollectionPageProps {
	collection: Collection;
	specialization: string;
	locale: string;
}

export const CollectionPage = ({ collection, specialization, locale }: CollectionPageProps) => {
	const { questionsCount, questions, isFree, company, specializations, keywords } = collection;

	const t = useTranslations(i18Namespace.collection);

	const guru = getGuruWithMatchingSpecialization(specializations || []);
	const newGuru = getNewGuruWithMatchingSpecialization(specializations);

	return (
		<Flex direction="column" align="start">
			<Text variant="head1" className={styles['sr-only']}>
				{t(Collections.COLLECTION_TITLE, { title: collection.title })}
			</Text>
			<Flex>
				<BackButton />
			</Flex>
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<CollectionHeader collection={collection} />
					<Card>
						<Flex align="center" direction="column" gap="12">
							<Button
								className={styles.button}
								variant="tertiary"
								preffix={<Icon icon="watch" size={24} />}
							>
								<Link href={ROUTES.avos.page}>{t(Collections.BANNER_INTERVIEW_WATCH_BUTTON)}</Link>
							</Button>
							{/*<CollectionNavigationButtons isDisabled={true} />*/}
						</Flex>
					</Card>
					<CollectionBody
						isFree={isFree}
						questions={questions || []}
						questionsCount={questionsCount || 0}
						specialization={specialization}
						locale={locale}
					/>
					{guru && (
						<div className={styles.banner}>
							<SidebarBanner guru={guru} newGuru={newGuru} />
						</div>
					)}
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<AdditionalInfo
						specializations={specializations}
						isFree={isFree}
						company={company}
						questionsCount={questionsCount}
						keywords={keywords}
					/>
					<SidebarBanner guru={guru} newGuru={newGuru} />
				</Flex>
			</Flex>
		</Flex>
	);
};
