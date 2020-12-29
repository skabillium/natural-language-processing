const natural = require('natural');
const jaccard = require('jaccard');
const cosine = require('cos-similarity');
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

	return taggedWords
		.filter((word) => !pos_tagger.closed_class_categories.includes(word.tag))
		.map((word) => {
			return { ...word, lemma: get_tagged_word_lemma(word.token, word.tag) };
		});
}

/**
 * Extract lemma from a given word
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

/**
 * Tokenize and stem text.
 * @param {String} text Text to be stemmed.
 * @returns {Array<String>} Stem array
 */
function stem_text(text) {
	const tokenized_text = tokenizer.tokenize(text);
	return tokenized_text.map((word) =>
		natural.PorterStemmer.stem(word.toLowerCase())
	);
}

/**
 * Get similarity index between 2 documents based on the jaccard and cosine similarity functions.
 * The index is the average between the 2 indexes | index = (jaccard+cosine)/2
 * @param {Array<String>} doc1 Document 1
 * @param {Array<String>} doc2 Document 2
 * @returns {Number} Similarity index
 */
function get_similarity(doc1, doc2) {
	const cosine_index = cosine(doc1, doc2);
	const jaccard_index = jaccard.index(doc1, doc2);

	return (cosine_index + jaccard_index) / 2;
}

module.exports = {
	tag_text,
	get_tagged_word_lemma,
	stem_text,
	get_similarity,
	tfidf: new natural.TfIdf(),
};
