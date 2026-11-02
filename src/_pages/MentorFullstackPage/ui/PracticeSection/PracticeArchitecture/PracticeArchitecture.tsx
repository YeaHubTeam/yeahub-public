import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import { MentorFullstack, i18Namespace } from '@/shared/config';
import { Card } from '@/shared/ui/Card';
import { Flex } from '@/shared/ui/Flex';
import { Text } from '@/shared/ui/Text';

import styles from './PracticeArchitecture.module.css';
import ArrowDashed from './assets/arrowDashed.svg';
import ArrowDown from './assets/arrowDown.svg';
import ArrowLeftDown from './assets/arrowLeftDown.svg';
import ArrowRightDown from './assets/arrowRightDown.svg';
import DoubleArrow from './assets/doubleArrow.svg';

interface DiagramNodeProps {
	title: string;
	subtitle?: string;
	subtitleShort?: string;
	extra?: string;
	accent?: boolean;
	center?: boolean;
	side?: boolean;
}

const DiagramNode = ({
	title,
	subtitle,
	subtitleShort,
	extra,
	accent = false,
	center = false,
	side = false,
}: DiagramNodeProps) => {
	return (
		<Card
			size="small"
			withOutsideShadow
			className={classNames(styles.node, {
				[styles['node-accent']]: accent,
				[styles['node-center']]: center,
				[styles['node-side']]: side,
			})}
			contentClassName={styles['node-body']}
		>
			<Text variant="body2-accent" className={styles['node-title']}>
				{title}
			</Text>
			{subtitle ? (
				<Text
					variant="body1"
					color={accent ? 'purple-700' : 'black-400'}
					className={styles['node-subtitle']}
				>
					{subtitleShort ? (
						<>
							<span className={styles.full}>{subtitle}</span>
							<span className={styles.short}>{subtitleShort}</span>
						</>
					) : (
						subtitle
					)}
				</Text>
			) : null}
			{extra ? (
				<Text variant="body1" color="purple-700" className={styles['pg-inline']}>
					{extra}
				</Text>
			) : null}
		</Card>
	);
};

interface VerticalArrowProps {
	className?: string;
	dashed?: boolean;
	up?: boolean;
}

const VerticalArrow = ({ className, dashed = false, up = false }: VerticalArrowProps) => {
	const Arrow = dashed ? ArrowDashed : ArrowDown;

	return (
		<span
			aria-hidden
			className={classNames(styles['vertical-arrow'], className, {
				[styles.dashed]: dashed,
				[styles['arrow-up']]: up,
			})}
		>
			<Arrow className={styles['vertical-arrow-image']} />
		</span>
	);
};

const ServiceArrows = ({ compact = false }: { compact?: boolean }) => {
	return (
		<div className={classNames(styles['service-arrows'], { [styles.compact]: compact })}>
			<VerticalArrow />
			<VerticalArrow />
		</div>
	);
};

export const PracticeArchitecture = () => {
	const t = useTranslations(i18Namespace.mentorFullstack);

	const clientTitle = t(MentorFullstack.PRACTICE_CLIENT_TITLE);
	const clientSubtitle = t(MentorFullstack.PRACTICE_CLIENT_SUBTITLE);
	const cicdTitle = t(MentorFullstack.PRACTICE_CICD_TITLE);
	const cicdSubtitle = t(MentorFullstack.PRACTICE_CICD_SUBTITLE);
	const postgres = t(MentorFullstack.PRACTICE_POSTGRES);

	return (
		<Card withOutsideShadow className={styles.card} contentClassName={styles.body}>
			<Flex direction="column" gap="4" className={styles.heading}>
				<Text variant="body5-accent" className={styles['heading-title']}>
					{t(MentorFullstack.PRACTICE_ARCHITECTURE_TITLE)}
				</Text>
				<Text variant="body3" color="black-500" className={styles['heading-description']}>
					{t(MentorFullstack.PRACTICE_ARCHITECTURE_DESCRIPTION)}
				</Text>
			</Flex>

			<div className={styles.diagram}>
				<div className={styles.top}>
					<div className={classNames(styles.stack, styles['client-stack'])}>
						<DiagramNode title={clientTitle} subtitle={clientSubtitle} center />
						<VerticalArrow className={styles['client-arrow']} />
					</div>
					<div className={classNames(styles.stack, styles['cicd-desktop'])}>
						<DiagramNode title={cicdTitle} subtitle={cicdSubtitle} accent />
						<VerticalArrow dashed />
					</div>
				</div>

				<div className={styles.docker}>
					<svg className={styles['docker-border']} aria-hidden>
						<rect
							x="0.5"
							y="0.5"
							width="calc(100% - 1px)"
							height="calc(100% - 1px)"
							rx="20"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							strokeDasharray="8 6"
							vectorEffect="non-scaling-stroke"
						/>
					</svg>
					<Text variant="body2-accent" color="purple-700" className={styles['docker-label']}>
						{t(MentorFullstack.PRACTICE_DOCKER)}
					</Text>

					<div className={styles.flow}>
						<DiagramNode
							title={t(MentorFullstack.PRACTICE_GATEWAY_TITLE)}
							subtitle={t(MentorFullstack.PRACTICE_GATEWAY_SUBTITLE)}
							center
						/>

						<div className={styles['desktop-fork']}>
							<ArrowLeftDown aria-hidden />
							<ArrowRightDown aria-hidden />
						</div>
						<DoubleArrow className={styles['mobile-fork']} aria-hidden />

						<div className={styles.services}>
							<DiagramNode
								title={postgres}
								subtitle={t(MentorFullstack.PRACTICE_AUTH_DB)}
								subtitleShort={t(MentorFullstack.PRACTICE_AUTH_DB_SHORT)}
								side
							/>
							<div className={styles['horizontal-arrow-left']}>
								<ArrowDown className={styles['horizontal-arrow-image']} aria-hidden />
							</div>
							<DiagramNode
								title={t(MentorFullstack.PRACTICE_AUTH_TITLE)}
								subtitle={t(MentorFullstack.PRACTICE_AUTH_SUBTITLE)}
								extra={postgres}
							/>
							<div className={styles['services-gap']} />
							<DiagramNode
								title={t(MentorFullstack.PRACTICE_ORDERS_TITLE)}
								subtitle={t(MentorFullstack.PRACTICE_ORDERS_SUBTITLE)}
								extra={postgres}
							/>
							<div className={styles['horizontal-arrow-right']}>
								<ArrowDown className={styles['horizontal-arrow-image']} aria-hidden />
							</div>
							<DiagramNode
								title={postgres}
								subtitle={t(MentorFullstack.PRACTICE_ORDERS_DB)}
								subtitleShort={t(MentorFullstack.PRACTICE_ORDERS_DB_SHORT)}
								side
							/>
						</div>

						<ServiceArrows />

						<div className={styles.bus}>
							<Text variant="body2-accent" color="white-900" className={styles['bus-text']}>
								<span className={styles.full}>{t(MentorFullstack.PRACTICE_BUS)}</span>
								<span className={styles.short}>{t(MentorFullstack.PRACTICE_BUS_SHORT)}</span>
							</Text>
						</div>

						<ServiceArrows compact />

						<div className={styles.results}>
							<DiagramNode
								title={t(MentorFullstack.PRACTICE_NOTIFICATIONS_TITLE)}
								subtitle={t(MentorFullstack.PRACTICE_NOTIFICATIONS_SUBTITLE)}
							/>
							<DiagramNode
								title={t(MentorFullstack.PRACTICE_WORKER_TITLE)}
								subtitle={t(MentorFullstack.PRACTICE_WORKER_SUBTITLE)}
							/>
						</div>
					</div>
				</div>

				<div className={styles['cicd-mobile']}>
					<VerticalArrow dashed up />
					<DiagramNode title={cicdTitle} subtitle={cicdSubtitle} accent center />
				</div>
			</div>
		</Card>
	);
};
