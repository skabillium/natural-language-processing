const { Article } = require('../article');
const Lemma = require('./lemma.model');
const { nlpService } = require('../nlp');

const mongoose = require('mongoose');

/**
 * Extract all the distinct lemmas from the articles in the database and
 * save them to their own database collection
 */
async function fetch_distinct_lemmas() {
	try {
		const articles = await Article.find({}, { _id: 1, pos_tags: 1 })
			.limit(3)
			.lean();

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i];

			console.log('TOTAL TOKENS', article.pos_tags.length);

			// Get just the lemmas from the tagged text
			const lemmas = article.pos_tags.map((entry) => {
				return entry.lemma;
			});

			/**
			 * Get the appearances for each unique lemma in the text and save
			 * it in the database
			 */
			for (let j = 0; j < lemmas.length; j++) {
				const lemma_name = lemmas[j];
				const appearances = lemmas.filter((entry) => entry === lemma_name)
					.length;

				// Check if lemma in already in the database
				let saved_lemma = await Lemma.findOne({ name: lemma_name });
				let lemma = {};

				if (saved_lemma) {
					// Update articles field only
					saved_lemma.set(`articles.${article._id}.appearances`, appearances);
					lemma = await saved_lemma.save();
				} else {
					// Create new database entry
					let articles_field = {};
					articles_field[article._id] = { appearances };

					lemma = new Lemma({
						_id: mongoose.Types.ObjectId(),
						name: lemma_name,
						articles: articles_field,
					});

					await lemma.save();
				}
			}
		}

		return Lemma.find().lean();
	} catch (error) {
		throw error;
	}
}

/**
 * Calculate total number of appearances and tf-idf metric for each distinct
 * lemma in the database
 */
async function create_inverted_index() {
	try {
		// Get all the articles and lemmas from the database
		const lemmas = await Lemma.find({}, { name: 1, articles: 1 });
		const articles = await Article.find({}, { _id: 1, pos_tags: 1 });
		// Initialize the tf-idf calculator
		const tfidf = nlpService.tfidf;

		// Load all the articles to the tf-idf calculator
		for (let i = 0; i < articles.length; i++) {
			const article = articles[i];
			const article_lemmas = article.pos_tags.map((word) => {
				return word.lemma;
			});
			tfidf.addDocument(article_lemmas);
		}

		// Calculate weight (tf-idf metric) for every lemma in the database
		for (let i = 0; i < lemmas.length; i++) {
			const lemma = lemmas[i];

			tfidf.tfidfs(lemma.name, function (index, measure) {
				if (measure > 0)
					lemma.set(`articles.${articles[index]._id}.weight`, measure);
			});

			await lemma.save();
		}
	} catch (error) {
		throw error;
	}
}

/**
 * Submit lemmas for inverted index querying
 * @param  {...String} lemmas Lemmas to query
 */
async function query_lemmas(...lemmas) {
	try {
		// Prepare database queries
		let query = {
			$or: lemmas.map((lemma) => {
				return { name: lemma };
			}),
		};

		query = {};
		// Get lemmas
		const search_results = await Lemma.find(query, {
			name: 1,
			articles: 1,
		}).lean();

		// Sort results by weight descending
		const result = search_results.map((r) => {
			return {
				name: r.name,
				documents: Object.entries(r.articles)
					.sort((a, b) => {
						return b[1].weight - a[1].weight;
					})
					.map((entry) => {
						return { id: entry[0], weight: entry[1].weight };
					}),
			};
		});

		return result;
	} catch (error) {
		throw error;
	}
}

module.exports = { fetch_distinct_lemmas, create_inverted_index, query_lemmas };
