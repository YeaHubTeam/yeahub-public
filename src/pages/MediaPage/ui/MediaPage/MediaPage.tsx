import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import Alarm from '@/shared/assets/images/alarm.png';
import { Media, i18Namespace } from '@/shared/config';
import { Banner } from '@/shared/ui/Banner';
import { Flex } from '@/shared/ui/Flex';
import { GurusBlock, OurMediaBanner, TelegramChannels } from '@/widgets/Media';

import styles from './MediaPage.module.css';

interface MediaPageProps {
	locale: string;
}

export const MediaPage = ({ locale }: MediaPageProps) => {
	setRequestLocale(locale);
	const t = useTranslations(i18Namespace.media);

	return (
		<Flex direction="column" className={styles.page}>
			<OurMediaBanner />
			<GurusBlock />
			<Banner img={Alarm} alt="Alarm" title={t(Media.FACT)} color="violet" />
			<TelegramChannels />
		</Flex>
	);
};
