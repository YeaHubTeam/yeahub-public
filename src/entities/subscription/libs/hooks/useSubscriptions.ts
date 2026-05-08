import { useFetchData } from '@/shared/api';

import { getSubscriptions } from '../../api/getSubscriptions';
import type { GetSubscriptionsResponse } from '../../model/types/subscription';

export const useSubscriptions = () => {
	return useFetchData<GetSubscriptionsResponse, void>({
		fetcher: getSubscriptions,
		params: undefined,
		initialData: null,
	});
};
