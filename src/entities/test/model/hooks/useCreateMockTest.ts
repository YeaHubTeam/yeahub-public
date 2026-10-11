'use client';

import { useLazyFetchData } from '@/shared/api';

import { createNewMockTest } from '../../api/createNewMockTest';
import type { CreateNewMockTestParamsRequest, CreateNewMockTestResponse } from '../types/test';

interface UseCreateMockTestProps {
	onSuccess?: (data: CreateNewMockTestResponse) => void;
	onError?: (error: unknown) => void;
}

export const useCreateMockTest = ({ onSuccess, onError }: UseCreateMockTestProps = {}) => {
	return useLazyFetchData<CreateNewMockTestResponse, CreateNewMockTestParamsRequest>({
		fetcher: createNewMockTest,
		initialData: null,
		onSuccess,
		onError,
	});
};
