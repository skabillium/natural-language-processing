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
		const articles = await Article.find({}, { _id: 1, pos_tags: 1 }).lean();
		let inserted_count = 0;

		for (let i = 0; i < articles.length; i++) {
			const article = articles[i];
			let article_lemma_count = 0;

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
					article_lemma_count++;
				}
			}
			console.log(
				`Successfully inserted ${article_lemma_count} lemmas from article ${article._id}`
			);
			inserted_count += article_lemma_count;
		}

		console.log(
			'Successfully inserted a total of',
			inserted_count,
			'unique lemmas'
		);

		return;
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

		console.log(
			`Creating index from ${articles.length} articles and ${lemmas.length} lemmas`
		);

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

		console.log('Inverted index was successfully created');
		return;
	} catch (error) {
		throw error;
	}
}

/**
 * Submit lemmas for inverted index querying
 * @param  {...String} lemmas Lemmas to query
 */
async function query_lemmas(output = true, ...lemmas) {
	try {
		// Prepare database queries
		let query = {
			$or: lemmas.map((lemma) => {
				return { name: new RegExp(lemma) };
			}),
		};

		// Get lemmas
		const search_results = await Lemma.find(query, {
			name: 1,
			articles: 1,
		}).lean();

		/**
		 * Sort results by weight descending and format database object
		 * to look like the sample.json file
		 */
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

		if (output) {
			if (result.length !== 0) {
				console.log(`Found the following ${result.length} lemmas`);
			} else {
				console.log('No lemmas found');
			}

			result.forEach((entry) => {
				console.log('Lemma:', entry.name);
				console.table(entry.documents);
			});
		}

		return;
	} catch (error) {
		throw error;
	}
}

/**
 * Get the average response time for a given number of queries
 * @param {Array} queries Array of queries to be submitted
 */
async function test_response_time(queries) {
	try {
		let response_times = [];
		for (let i = 0; i < queries.length; i++) {
			const query = queries[i];

			const start = new Date();
			await query_lemmas(false, ...query);
			const diff = new Date() - start;
			response_times.push(diff);
		}

		average_time =
			response_times.reduce((total, time) => total + time) /
			response_times.length;

		console.log('Average query response time:', average_time, 'ms');
		return;
	} catch (error) {
		throw error;
	}
}

module.exports = {
	fetch_distinct_lemmas,
	create_inverted_index,
	query_lemmas,
	test_response_time,
};
