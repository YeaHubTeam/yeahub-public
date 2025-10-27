// eslint-disable-next-line @conarti/feature-sliced/layers-slices
import { Specialization } from '@/entities/specialization/@x/socialMedia';

import { socialMediaLinks } from '../constants/socialMedia';

export const getChannelsForSpecialization = (
	specializationsOrId: number | Specialization[] | undefined,
) => {
	if (typeof specializationsOrId === 'number') {
		return socialMediaLinks.find((link) => link.specializationId === specializationsOrId);
	}

	if (Array.isArray(specializationsOrId) && specializationsOrId.length > 0) {
		return socialMediaLinks.find((link) => link.specializationId === specializationsOrId[0].id);
	}

	return undefined;
};
