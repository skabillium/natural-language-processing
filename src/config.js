const path = require('path');

/**
 * Config object for all project constants
 */
module.exports = {
	files: {
		root_dir: path.join(__dirname, '..'),
		default_xml_name: 'inverted-index.xml',
		default_json_name: 'inverted-index.json',
	},
	urls: {
		nyt: 'https://nytimes.com',
		cbs: 'https://www.cbsnews.com/world/',
		database: 'mongodb://localhost:27017/nlp',
	},
	pos_tagger: {
		language: 'EN',
		default_category: 'N',
		default_category_capitalized: 'NNP',
		closed_class_categories: [
			'CD',
			'CC',
			'DT',
			'EX',
			'IN',
			'LS',
			'MD',
			'PDT',
			'POS',
			'PRP',
			'PRP$',
			'RP',
			'TO',
			'UH',
			'WDT',
			'WP',
			'WP$',
			'WRB',
		],
		open_class_categories: {
			adjectives: ['JJ', 'JJR', 'JJS', 'RB', 'RBR', 'RBS'],
			nouns: ['NN', 'NNS', 'NNP', 'NNPS'],
			verbs: ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'],
			foreign: ['FW'],
		},
	},
};
