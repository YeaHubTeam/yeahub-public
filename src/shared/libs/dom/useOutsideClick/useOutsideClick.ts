import { useEffect, useRef } from 'react';

export const useOutsideClick = <T extends HTMLElement = HTMLElement>(
	callback: () => void,
	options?: {
		enabled?: boolean;
		eventType?: 'mousedown' | 'click';
	},
) => {
	const { enabled = true, eventType = 'mousedown' } = options || {};
	const ref = useRef<T>(null);

	const callbackRef = useRef(callback);
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!enabled) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (!ref.current || !event.target) return;

			const target = event.target as Node;
			if (!ref.current.contains(target)) {
				callbackRef.current();
			}
		};

		if (typeof document !== 'undefined') {
			document.addEventListener(eventType, handleClickOutside);

			return () => {
				document.removeEventListener(eventType, handleClickOutside);
			};
		}
	}, [enabled, eventType]);

	return ref;
};
