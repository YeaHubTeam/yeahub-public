import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { BannerButton } from '../BannerButton/BannerButton';
import { BannerDescription } from '../BannerDescription/BannerDescription';
import { BannerSticker } from '../BannerSticker/BannerSticker';
import { BannerTitle } from '../BannerTitle/BannerTitle';

export const BannerContent = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex direction="column" align="center">
			<BannerSticker text={t(Mentor.BANNER_STICKER)} />
			<Flex direction="column" align="center">
				<BannerTitle />
				<BannerDescription />
				<BannerButton />
			</Flex>
		</Flex>
	);
};
