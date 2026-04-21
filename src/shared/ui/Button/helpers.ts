import { VariantType } from './types';

const tagNameByVariants: Record<VariantType, 'button' | 'a'> = {
	primary: 'button',
	secondary: 'button',
	outline: 'button',
	tertiary: 'button',
	'tertiary-link': 'button',
	destructive: 'button',
	'destructive-secondary': 'button',
	'destructive-outline': 'button',
	'destructive-tertiary': 'button',
	link: 'a',
	'link-gray': 'a',
	'link-purple': 'a',
	'primary-inverse': 'button',
};

const LINK_TEXT_VARIANTS = new Set<VariantType>(['link', 'link-gray', 'link-purple']);

export const isLinkTextVariant = (variant: VariantType): boolean => LINK_TEXT_VARIANTS.has(variant);

export const getTagName = (variant: VariantType, hasHref?: boolean): 'button' | 'a' => {
	if (hasHref) {
		return 'a';
	}
	return tagNameByVariants[variant];
};

export const getStylePrefix = (variant: VariantType): 'button' | 'a' =>
	isLinkTextVariant(variant) ? 'a' : 'button';
