import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

const CollectionsRoot = () => {
	redirect(`/collections/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default CollectionsRoot;
