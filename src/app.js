const mongoose = require('mongoose');
const config = require('./config');
const { articleService, Article } = require('./article');
const { lemmaService } = require('./lemma');
const { fileService } = require('./file');

const fs = require('fs');

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

// Fetch articles for database
// articleService
// 	.fetch_articles()
// 	.then((articles) => {
// 		console.table(articles);
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(1);
// 	});

// Create inverted index
// lemmaService
// 	.create_inverted_index()
// 	.then((d) => {
// 		fs.writeFileSync('yolo.json', JSON.stringify(d));
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(1);
// 	});

// Fetch lemmas for database
// lemmaService
// 	.fetch_distinct_lemmas()
// 	.then((r) => {
// 		console.log('UNIQUE LEMMAS', r.length);
// 		fs.writeFileSync('lemmas.json', JSON.stringify(r));
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(1);
// 	});

// Export file
// fileService
// 	.export_file('test.json')
// 	.then(() => {
// 		console.log('done');
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(0);
// 	});

// Parse file
fileService
	.parse_file('sample.json')
	.then((lemmas) => {
		console.table(lemmas);
		process.exit(0);
	})
	.catch((e) => {
		console.log(e);
		process.exit(0);
	});

// Get some articles
// Article.findOne({ _id: '5fc504ee66673f247ac8fb9f' })
// 	.lean()
// 	.then((a) => {
// 		fs.writeFileSync('some-articles.json', JSON.stringify(a));
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(1);
// 	});

// Delete all articles
// Article.deleteMany({})
// 	.then((d) => {
// 		console.log(d);
// 		process.exit(0);
// 	})
// 	.catch((e) => {
// 		console.log(e);
// 		process.exit(1);
// 	});
