import { Community, Material, StructurAndPlan } from '@/shared/assets/images/mentor';

import { mentorCard } from '../types/mentorCard';

export const FullPathCards: mentorCard[] = [
	{
		title: 'Полностью свои материалы',
		description:
			'200+&nbsp;записей, чеклисты, гайды, реальные собеседования. Авторские курсы от&nbsp;HTML, JS&nbsp;и&nbsp;React до&nbsp;CI/CD, Docker и&nbsp;System Design. Всё создано мной&nbsp;&mdash; никаких чужих курсов.',
		imageSrc: Material,
	},
	{
		title: 'Сообщество',
		description:
			'250+ активных учеников, совместные моки, онлайн-коворкинг и&nbsp;групповые занятия. Видя успехи других, ты&nbsp;включаешься в&nbsp;гонку и&nbsp;движешься к&nbsp;офферу.',
		imageSrc: Community,
	},
	{
		title: 'Структура и&nbsp;план',
		description:
			'Теория + лайвкодинг: подготовка к&nbsp;собеседованиям начинается с&nbsp;первых уроков. После каждого раздела контроль знаний&nbsp;&mdash; без сдачи экзамена не&nbsp;идём дальше.',
		imageSrc: StructurAndPlan,
	},
];
