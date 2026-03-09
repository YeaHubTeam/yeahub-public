module.exports = {
	icon: true,
	svgo: true,
	svgoConfig: {
		plugins: [{ name: 'convertColors', params: { currentColor: true } }],
	},
};
