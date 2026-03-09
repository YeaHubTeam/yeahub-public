const matchOptionalTicketNumberWithSpaceAfter = /^YH-\d+: .+$/;

export default {
	parserPreset: {
		parserOpts: {
			headerPattern: new RegExp('^' + matchOptionalTicketNumberWithSpaceAfter.source + '$'),
			headerCorrespondence: ['header'],
		},
	},
	plugins: [
		{
			rules: {
				'header-match-team-pattern': (parsed) => {
					const { header } = parsed;

					if (header.includes('Release')) {
						return [true, ''];
					}

					if (!matchOptionalTicketNumberWithSpaceAfter.test(header)) {
						return [false, 'Коммит должен начинаться с YH-XXX: '];
					}
					return [true, ''];
				},
			},
		},
	],
	rules: {
		'header-match-team-pattern': [2, 'always'],
	},
};
