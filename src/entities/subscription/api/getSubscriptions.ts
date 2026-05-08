import { apiFetch } from '@/shared/api';

import { subscriptionsApiUrls } from '../model/constants/subscriptions';
import { GetSubscriptionsResponse } from '../model/types/subscription';

export function getSubscriptions() {
	return apiFetch<GetSubscriptionsResponse>(subscriptionsApiUrls.getSubscriptions);
}
