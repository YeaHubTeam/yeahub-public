import { AvosBannerSkeleton, AvosListenSkeleton, AvosPromoSkeleton } from '@/widgets/Avos';

export const AvosPageSkeleton = () => {
	return (
		<>
			<AvosBannerSkeleton />
			<AvosPromoSkeleton />
			<AvosListenSkeleton />
		</>
	);
};
