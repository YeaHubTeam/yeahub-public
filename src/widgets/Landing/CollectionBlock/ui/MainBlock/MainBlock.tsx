import { useTranslations } from 'next-intl';

import { CollectionPreview } from '@/entities/collection';
import { Landing } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Slider } from '@/shared/ui/Slider';

import { sberImg, tbankImg, vkImg } from '../../model/assets';
import { sliderSettings } from '../../model/constants';
import styles from './MainBlock.module.css';

export const MainBlock = () => {
	const t = useTranslations('landing');
	const { isMobile } = useScreenSize();

	const mockCards = [
		{
			id: 1,
			title: t(Landing.COLLECTION_CARD_SBER),
			description: '',
			imageSrc: sberImg.src,
			keywords: ['Frontend'],
			specializations: [
				{
					id: 1,
					title: 'Frontend',
					description: '',
					slug: 'frontend',
				},
			],
			tariff: 'premium' as const,
			isFree: false,
			slug: 'sber',
		},
		{
			id: 2,
			title: t(Landing.COLLECTION_CARD_TBANK),
			description: '',
			imageSrc: tbankImg.src,
			keywords: ['Frontend'],
			specializations: [
				{
					id: 2,
					title: 'Frontend',
					description: '',
					slug: 'frontend',
				},
			],
			tariff: 'premium' as const,
			isFree: false,
			slug: 'tbank',
		},
		{
			id: 3,
			title: t(Landing.COLLECTION_CARD_VK),
			description: '',
			imageSrc: vkImg.src,
			keywords: ['Backend'],
			specializations: [
				{
					id: 3,
					title: 'Backend',
					description: '',
					slug: 'backend',
				},
			],
			tariff: 'premium' as const,
			isFree: false,
			slug: 'vk',
		},
	];

	const renderCards = mockCards.map((collection, index) => (
		<div key={index} data-testid="MainBlock_Card">
			<CollectionPreview
				variant="column"
				collection={collection}
				specialization={collection.specializations[0]?.slug || 'unknown'}
			/>
		</div>
	));

	if (isMobile) {
		return (
			<Flex
				dataTestId="MainBlock_Mobile"
				gap="20"
				className={styles['main-block']}
				direction="column"
			>
				{renderCards}
			</Flex>
		);
	}

	return (
		<div data-testid="MainBlock_Desktop" className={styles['main-block']}>
			<Slider {...sliderSettings} className={styles['slider-container']}>
				{renderCards}
			</Slider>
		</div>
	);
};
