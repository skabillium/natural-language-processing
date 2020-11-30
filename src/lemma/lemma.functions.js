const { Article } = require('../article');
const Lemma = require('./lemma.model');

const { isEmpty } = require('lodash');
const mongoose = require('mongoose');

/**
 * Extract all the distinct lemmas from the articles in the database and
 * save them to their own database collection
 */
async function fetch_lemmas() {
	const articles = await Article.find({}, { _id: 1, pos_tags: 1 }).lean();

	for (let i = 0; i < articles.length; i++) {
		const article = articles[i];

		// Get just the lemmas from the tagged text
		const lemmas = article.pos_tags.filter((entry) => {
			if (!isEmpty(entry.lemma)) return entry.lemma;
		});

		/**
		 * Get the appearances for each unique lemma in the text and save
		 * it in the database
		 */
		for (let j = 0; j < lemmas.length; j++) {
			const lemma = lemmas[j];
			const appearances = lemmas.reduce((count, l) => {
				if (l === lemma) count++;
			});

			// Check if lemma in already in the database

			const obj = {
				_id: mongoose.Types.ObjectId(),
			};
		}
	}
}

module.exports = { fetch_lemmas };
