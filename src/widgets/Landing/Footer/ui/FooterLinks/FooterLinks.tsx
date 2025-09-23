import React from 'react';

import Link from 'next/link';

import { getLocale, getTranslations } from 'next-intl/server';

import { Flex } from '@/shared/ui/Flex';
import { Icon } from '@/shared/ui/Icon';
import { Text } from '@/shared/ui/Text';

import { RESOURCES_LINKS } from '../../model/constants/footerConstants';
import styles from './FooterLinks.module.css';

export const FooterLinks = async () => {
	const t = await getTranslations('landing.footer');
	const locale = await getLocale();

	return (
		<Flex dataTestId="FooterLinks" className={styles['footer-resources-links']}>
			<Link data-testid="Footer_NavDocs" href={`/${locale}/docs`}>
				<Text
					dataTestId="Footer_Docs"
					className={styles['docs-link']}
					variant="body2-accent"
					color="black-400"
				>
					{t('docs')}
				</Text>
			</Link>

			<Link data-testid="Footer_NavMedia" href={`/${locale}/media`}>
				<Text
					dataTestId="Footer_Media"
					className={styles['docs-link']}
					variant="body2-accent"
					color="black-400"
				>
					{t('media')}
				</Text>
			</Link>

			{RESOURCES_LINKS.map(({ url, label, icon, color, className }) => (
				<a
					key={url}
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${label} ${t('links.link.aria-label')}`}
					className={styles[className]}
				>
					<Icon icon={icon} color={color} dataTestId={`icon-${label}`} />
				</a>
			))}
		</Flex>
	);
};
