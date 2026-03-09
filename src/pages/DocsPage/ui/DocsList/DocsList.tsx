import { Flex } from '@/shared/ui/Flex';

import { docs } from '../../model/constants';
import { DocItem } from '../DocsItem/DocItem';

export const DocsList = () => {
	return (
		<Flex direction="column" gap="40">
			{docs.map((doc) => (
				<DocItem key={doc.link} doc={doc} />
			))}
		</Flex>
	);
};
