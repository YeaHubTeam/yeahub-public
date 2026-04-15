import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Collection, CollectionPreview } from '@/entities/collection';
import { Landing, ROUTES, i18Namespace } from '@/shared/config';
import { DEFAULT_SPECIALIZATION_SLUG, route } from '@/shared/libs';
import { Button } from '@/shared/ui/Button';
import { Slider } from '@/shared/ui/Slider';

import { sliderSettings } from '../../model/constants';
import styles from './MainBlock.module.css';

interface MainBlockProps {
	collections: Collection[];
	locale: string;
}

export const MainBlock = ({ collections, locale }: MainBlockProps) => {
	const t = useTranslations(i18Namespace.landing);

	const renderCards = collections.map((collection) => (
		<div className={styles.collection} key={collection.id} data-testid="MainBlock_Card">
			<CollectionPreview
				variant="column"
				collection={collection}
				specialization={collection.specializations?.[0]?.slug || DEFAULT_SPECIALIZATION_SLUG}
				locale={locale}
			/>
		</div>
	));

	return (
		<div className={styles['main-block']}>
			<div data-testid="MainBlock_Mobile" className={styles['mobile-view']}>
				{renderCards}
			</div>

			<div data-testid="MainBlock_Desktop" className={styles['desktop-view']}>
				<Slider {...sliderSettings} className={styles['slider-container']}>
					{renderCards}
				</Slider>
			</div>
			<Link href={`${locale}${route(ROUTES.collections.page, DEFAULT_SPECIALIZATION_SLUG)}`}>
				<Button
					dataTestId="AdditionalBlock_ExpandButton"
					className={styles['expand-button']}
					variant="outline"
				>
					{t(Landing.COLLECTION_EXPAND)}
				</Button>
			</Link>
		</div>
	);
};
