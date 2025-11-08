import Link from 'next/link';

import { useTranslations } from 'next-intl';

import { Translation, i18Namespace } from '@/shared/config';
import { ROUTES } from '@/shared/config';
import { route } from '@/shared/libs';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

export interface Author {
	id: string;
	username: string;
}

export interface AuthorInfoProps {
	createdBy: Author;
	isCenter?: boolean;
}

export const AuthorInfo = ({ createdBy, isCenter }: AuthorInfoProps) => {
	const t = useTranslations(i18Namespace.translation);
	const path = ROUTES.users.page;

	return (
		<Flex justify={isCenter ? 'center' : 'start'} gap="4">
			<Text variant="body2-accent" color="black-800">
				{t(Translation.AUTHOR)}:
			</Text>
			<Link href={route(path, createdBy.id)}>
				<Text variant="body2-accent" color="purple-700">
					{createdBy.username}
				</Text>
			</Link>
		</Flex>
	);
};
