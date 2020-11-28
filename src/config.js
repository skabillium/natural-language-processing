/**
 * Config object for all project constants
 */
module.exports = {
	urls: {
		nyt: 'https://nytimes.com',
		cbs: 'https://www.cbsnews.com/world/',
		database: 'mongodb://localhost:27017/nlp',
	},
	pos_tagger: {
		language: 'EN',
		default_category: 'N',
		default_category_capitalized: 'NNP',
	},
};
