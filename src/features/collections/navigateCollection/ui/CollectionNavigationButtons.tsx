'use client';

import { useTranslations } from 'next-intl';

import { Collections, i18Namespace } from '@/shared/config';
import { useScreenSize } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';

export interface CollectionNavigationButtonsProps {
	isDisabled: boolean;
}

export const CollectionNavigationButtons = ({ isDisabled }: CollectionNavigationButtonsProps) => {
	const t = useTranslations(i18Namespace.collection);
	const { isMobileS } = useScreenSize();

	const buttonVariant = isMobileS ? 'link-gray' : 'tertiary';

	const onMovePrev = () => {
		console.log('prev');
	};

	const onMoveNext = () => {
		console.log('next');
	};

	return (
		<Flex justify="center" gap="20">
			<Button
				variant={buttonVariant}
				preffix={<Icon icon="altArrowLeft" color="black-600" size={24} />}
				onClick={onMovePrev}
				disabled={isDisabled}
			>
				{t(Collections.NAVIGATION_PREVIOUS)}
			</Button>
			<Button
				variant={buttonVariant}
				suffix={<Icon icon="altArrowRight" color="black-600" size={24} />}
				onClick={onMoveNext}
				disabled={isDisabled}
			>
				{t(Collections.NAVIGATION_NEXT)}
			</Button>
		</Flex>
	);
};
