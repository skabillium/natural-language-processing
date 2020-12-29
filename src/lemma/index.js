/**
 * Separate lemma module file for easier imports in other modules
 */

module.exports = {
	Lemma: require('./lemma.model'),
	lemmaService: require('./lemma.functions'),
};
