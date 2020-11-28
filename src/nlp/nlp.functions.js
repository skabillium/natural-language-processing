const natural = require('natural');
const config = require('../config');

// Initialize tagger
const lexicon = new natural.Lexicon(
	config.pos_tagger.language,
	config.pos_tagger.default_category,
	config.pos_tagger.default_category_capitalized
);
const ruleSet = new natural.RuleSet(config.pos_tagger.language);
const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

/**
 * Tag article body
 * @param {Object} body The article body
 */
function tag_text(body) {
	const tokenized_body = tokenizer.tokenize(body);
	const result = tagger.tag(tokenized_body);
	return result.taggedWords;
}

module.exports = { tag_text };
