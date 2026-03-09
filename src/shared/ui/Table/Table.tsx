'use client';

import { ReactNode } from 'react';

import { SelectedEntity } from '@/shared/libs/app';
import { CopyButton } from '@/shared/ui/CopyButton';

import styles from './Table.module.css';

interface TableProps<_Id extends string | number, T> {
	/**
	 * Array of elements displayed in the table
	 */
	items: T[];
	/**
	 * Render function for displaying the table header
	 */
	renderTableHeader: () => ReactNode;
	/**
	 * Render function for displaying the table body
	 */
	renderTableBody: (item: T, index?: number) => ReactNode;
	/**
	 * Render function for displaying the table actions in the last column
	 */
	renderActions?: (item: T) => ReactNode;
	/**
	 * Render function for defining column widths in the table.
	 */
	renderTableColumnWidths?: () => ReactNode;
	/**
	 * Shows a copy button
	 */
	hasCopyButton?: boolean;
}

/**
 * Component that is used to display data in a tabular structure.
 *
 * @param items - Array of elements displayed in the table.
 * @param renderTableHeader - Render function for displaying the table header.
 * @param renderTableBody - Render function for displaying the table body.
 * @param renderActions - Render function for displaying the table actions in the last column.
 */
export const Table = <Id extends string | number, T extends SelectedEntity<Id>>({
	items,
	renderTableHeader,
	renderTableBody,
	renderActions,
	renderTableColumnWidths,
	hasCopyButton,
}: TableProps<Id, T>) => {
	const hasActions = !!renderActions;

	return (
		<table className={styles.table} data-testid="table">
			<colgroup>
				{renderTableColumnWidths?.()}
				{hasActions && <col className={styles['actions-column']} />}
				{hasCopyButton && <col className={styles['actions-column']} />}
			</colgroup>
			<thead className={`${styles.head} ${styles.bg}`}>
				<tr>
					{renderTableHeader()}
					{hasActions && <td className={styles['actions-column']}></td>}
					{hasCopyButton && <td className={styles['actions-column']}></td>}
				</tr>
			</thead>
			<tbody>
				{items.map((item, index) => (
					<tr key={item.id} className={styles.row} data-testid="table-row">
						{renderTableBody(item, index)}
						{hasActions && <td className={styles['actions-column']}>{renderActions?.(item)}</td>}
						{hasCopyButton && (
							<td className={styles['actions-column']}>
								<CopyButton data-testid="Table_CopyButton" text={String(item.id)} />
							</td>
						)}
					</tr>
				))}
			</tbody>
		</table>
	);
};
