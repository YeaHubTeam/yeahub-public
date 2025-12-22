import { redirect } from 'next/navigation';

import { DEFAULT_SPECIALIZATION_SLUG } from '@/shared/libs';

const ResourcesRoot = () => {
	redirect(`/resources/${DEFAULT_SPECIALIZATION_SLUG}`);
};

export default ResourcesRoot;
