/**
 * Separate article module file for easier imports in other modules
 */

module.exports = {
	Article: require('./article.model'),
	articleService: require('./article.functions'),
};
