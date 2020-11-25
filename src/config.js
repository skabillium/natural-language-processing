/**
 * Config object for all project constants
 */
module.exports = {
	urls: {
		nyt: 'https://nytimes.com',
		database: 'mongodb://localhost:27017/nlp',
	},
	regex: {
		html: /^.*.html$/i,
	},
	pos_tagger: {
		language: 'EN',
		default_category: 'N',
		default_category_capitalized: 'NNP',
	},
};
