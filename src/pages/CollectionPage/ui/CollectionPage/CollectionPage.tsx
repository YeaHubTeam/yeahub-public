import { useTranslations } from 'next-intl';

import type { Collection } from '@/entities/collection';
import { GurusBanner, getGuruWithMatchingSpecialization } from '@/entities/guru';
import { CollectionNavigationButtons } from '@/features/collections/navigateCollection';
import { Collections, Link, ROUTES, i18Namespace } from '@/shared/config';
import { SPEC_MAP } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { AdditionalInfo, CollectionBody, CollectionHeader } from '@/widgets/Collection';

import styles from './CollectionPage.module.css';

interface CollectionPageProps {
	collection: Collection;
	specialization: keyof typeof SPEC_MAP;
}

export const CollectionPage = ({ collection, specialization }: CollectionPageProps) => {
	const {
		createdBy,
		questionsCount,
		questions,
		isFree,
		company,
		specializations,
		keywords,
		title,
		description,
		imageSrc: collectionImageSrc,
	} = collection;

	const imageSrc = collectionImageSrc ?? company?.imageSrc;

	const t = useTranslations(i18Namespace.collection);

	const guru = getGuruWithMatchingSpecialization(specializations || []);
	const showAuthor = guru ? false : true;
	const avosLink = ROUTES.avos.page;

	return (
		<Flex direction="column" align="start">
			<Flex gap="20" maxWidth>
				<Flex gap="20" direction="column" flex={1} maxWidth>
					<CollectionHeader
						title={title}
						description={description}
						imageSrc={imageSrc}
						company={company}
					/>
					<Card>
						<Flex align="center" direction="column" gap="12">
							<Button
								className={styles.button}
								variant="tertiary"
								preffix={<Icon icon="watch" size={24} />}
							>
								<Link href={avosLink}>{t(Collections.BANNER_INTERVIEW_WATCH_BUTTON)}</Link>
							</Button>
							<CollectionNavigationButtons isDisabled={true} />
						</Flex>
					</Card>
					<CollectionBody
						isFree={isFree}
						questions={questions || []}
						specialization={specialization}
					/>
				</Flex>
				<Flex direction="column" gap="20" className={styles.additional}>
					<AdditionalInfo
						showAuthor={showAuthor}
						specializations={specializations}
						isFree={isFree}
						company={company}
						questionsCount={questionsCount}
						createdBy={createdBy}
						keywords={keywords}
					/>
					{guru && <GurusBanner gurus={[guru]} />}
				</Flex>
			</Flex>
		</Flex>
	);
};
