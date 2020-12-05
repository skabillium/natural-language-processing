const mongoose = require('mongoose');
const path = require('path');
const config = require('./config');
const { articleService, Article } = require('./article');
const { lemmaService } = require('./lemma');
const { fileService } = require('./file');

async function main() {
	try {
		// Connect to database
		mongoose.connect(
			config.urls.database,
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
			(err) => {
				if (err) console.log(err);
			}
		);
		mongoose.Promise = global.Promise;

		// Parse arguments
		const arguments = process.argv.slice(2);
		if (!arguments[0]) {
			throw new Error(
				'Command not specified. Please provide one of the following commands: fetch, find, import and export'
			);
		}

		// Get command
		switch (arguments[0]) {
			case 'fetch':
				if (!arguments[1]) {
					throw new Error(
						'Invalid params, use fetch articles | lemmas | index'
					);
				} else if (arguments[1] === 'articles') {
					// fetch articles for database
					return articleService.fetch_articles();
				} else if (arguments[1] === 'lemmas') {
					// fetch lemmas for database
					return lemmaService.fetch_distinct_lemmas();
				} else if (arguments[1] === 'index') {
					// create inverted index from database lemmas
					return lemmaService.create_inverted_index();
				} else {
					throw new Error(`Invalid param ${arguments[1]}`);
				}

			case 'find':
				if (!arguments[1]) {
					throw new Error('Please provide space separated search terms');
				} else {
					// Search
					arguments.shift();
					return lemmaService.query_lemmas(true, ...arguments);
				}

			case 'export':
				// Export file
				return fileService.export_file(arguments[1]);

			case 'import':
				// Import file
				return fileService.parse_file(arguments[1]);

			case 'test':
				// Test with query file
				if (!arguments[1]) {
					throw new Error('Query file is required');
				} else {
					return lemmaService.test_response_time(
						require(path.join(config.files.root_dir, arguments[1]))
					);
				}

			default:
				throw new Error('Invalid command name');
		}
	} catch (error) {
		throw error;
	}
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error.message);
		process.exit(0);
	});
