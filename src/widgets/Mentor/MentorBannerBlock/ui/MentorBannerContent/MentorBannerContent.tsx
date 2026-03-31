import { useTranslations } from 'next-intl';

import { Mentor, i18Namespace } from '@/shared/config';
import { Flex } from '@/shared/ui/Flex';

import { MentorBannerButton } from '../MentorBannerButton/MentorBannerButton';
import { MentorBlockDescription } from '../MentorBlockDescription/MentorBlockDescription';
import { MentorBlockTitle } from '../MentorBlockTitle/MentorBlockTitle';
import { MentorSticker } from '../MentorSticker/MentorSticker';

export const MentorBannerContent = () => {
	const t = useTranslations(i18Namespace.mentor);

	return (
		<Flex direction="column" align="center">
			<MentorSticker text={t(Mentor.BANNER_STICKER)} />
			<Flex direction="column" align="center">
				<MentorBlockTitle />
				<MentorBlockDescription />
				<MentorBannerButton />
			</Flex>
		</Flex>
	);
};
