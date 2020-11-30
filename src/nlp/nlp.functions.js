const natural = require('natural');
const { pos_tagger } = require('../config');

const lemmatize = require('wink-lemmatizer');

// Initialize tagger
const lexicon = new natural.Lexicon(
	pos_tagger.language,
	pos_tagger.default_category,
	pos_tagger.default_category_capitalized
);
const ruleSet = new natural.RuleSet(pos_tagger.language);
const tagger = new natural.BrillPOSTagger(lexicon, ruleSet);

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

/**
 * Tag article body with tag and lemma.
 * @param {Object} body The article body
 */
function tag_text(body) {
	const tokenized_body = tokenizer.tokenize(body);
	const { taggedWords } = tagger.tag(tokenized_body);

	for (let i = 0; i < taggedWords.length; i++) {
		let word = taggedWords[i];

		// If closed class category don't extract lemma
		if (pos_tagger.closed_class_categories.includes(word.tag)) continue;

		word.lemma = get_tagged_word_lemma(word.token, word.tag);
	}

	return taggedWords;
}

/**
 * Get lemma from word
 * @param {String} word The word to be searched
 */
function get_tagged_word_lemma(word, tag) {
	// Convert to lower case
	word = word.toLowerCase();

	// If word is a verb
	if (pos_tagger.open_class_categories.verbs.includes(tag))
		return lemmatize.verb(word);
	// If it's an adjective or adverb
	else if (pos_tagger.open_class_categories.adjectives.includes(tag))
		return lemmatize.adjective(word);
	// If it's a noun or foreign word
	else return lemmatize.noun(word);
}

module.exports = { tag_text, get_tagged_word_lemma };
