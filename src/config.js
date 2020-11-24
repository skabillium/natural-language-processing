/**
 * Config object for all project constants
 */
module.exports = {
	urls: {
		nyt: 'https://nytimes.com',
		wsj: 'https://wsj.com',
		cnn: 'https://edition.cnn.com/',
		database: process.env.DATABASE_URL,
	},
	regex: {
		html: /^.*.html$/i,
	},
};
