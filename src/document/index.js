/**
 * Separate document module file for easier imports in other modules
 */

module.exports = {
	Document: require('./document.model'),
	documentService: require('./document.functions'),
};
