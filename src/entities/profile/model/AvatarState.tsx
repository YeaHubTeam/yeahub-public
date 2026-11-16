'use client';

import { createContext, useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

type AvatarValue = { userId: string; avatarUrl: string | null };
type AvatarState = {
	value: AvatarValue | null;
	beginChange: (userId: string) => (avatarUrl: string | null) => boolean;
};
const AvatarContext = createContext<AvatarState>({ value: null, beginChange: () => () => false });

// A display projection only. This context never authorizes a backend operation.
export const AvatarStateProvider = ({
	userId,
	children,
}: {
	userId: string | null;
	children: ReactNode;
}) => {
	const [value, setValue] = useState<AvatarValue | null>(null);
	const [identity, setIdentity] = useState(userId);
	const scope = useRef({ userId, revision: 0, active: false });
	if (identity !== userId) {
		setIdentity(userId);
		setValue(null);
	}
	useLayoutEffect(() => {
		const current = scope.current;
		current.userId = userId;
		current.revision++;
		current.active = true;
		return () => {
			current.active = false;
			current.revision++;
		};
	}, [userId]);
	const beginChange = useCallback((owner: string) => {
		const revision = ++scope.current.revision;
		return (avatarUrl: string | null) => {
			if (
				!scope.current.active ||
				scope.current.userId !== owner ||
				scope.current.revision !== revision
			)
				return false;
			setValue({ userId: owner, avatarUrl });
			return true;
		};
	}, []);
	return (
		<AvatarContext.Provider value={{ value: value?.userId === userId ? value : null, beginChange }}>
			{children}
		</AvatarContext.Provider>
	);
};
export const useAvatarState = () => useContext(AvatarContext);
