export const isNavPathActive = (pathname: string, path: string) => {
	if (!path || path === '#') return false;

	const currentPath = pathname.replace(/^\/[^/]+/, '') || '/';

	return currentPath === path || currentPath.startsWith(`${path}/`);
};
