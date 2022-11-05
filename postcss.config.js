module.exports = (ctx) => ({
	plugins: {
		'postcss-import': {},
		cssnano: ctx.env === 'prod' ? {} : false
	}
})