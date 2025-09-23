module.exports = {
	icon: true,
	svgo: true,
	svgProps: {
		fill: 'currentColor',
	},
	svgoConfig: {
		plugins: [{ name: 'convertColors', params: { currentColor: true } }],
	},
};
