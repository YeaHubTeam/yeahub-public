import { redirect } from 'next/navigation';

import { getSpecializationSlugs } from '@/entities/specialization';
import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

const CollectionsRoot = async () => {
	const { data: slugs } = await getSpecializationSlugs().catch(() => ({ data: [] }));

	const defaultSlugExists = slugs.some((s) => s.slug === DEFAULT_SPECIALIZATION_SLUG);

	const targetSlug = defaultSlugExists
		? DEFAULT_SPECIALIZATION_SLUG
		: (slugs[0]?.slug ?? DEFAULT_SPECIALIZATION_SLUG);

	redirect(`/collections/${targetSlug}`);
};

export default CollectionsRoot;
