'use client';

import { useCallback, useRef } from 'react';

type Timer = ReturnType<typeof setTimeout>;

export function useDebounce<T extends unknown[]>(callback: (...args: T) => void, delay: number) {
	const debounceTimerRef = useRef<Timer>(undefined);
	return useCallback(
		(...args: T) => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
			debounceTimerRef.current = setTimeout(() => {
				callback(...args);
			}, delay);
		},
		[callback, delay],
	);
}
