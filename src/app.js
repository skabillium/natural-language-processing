const mongoose = require('mongoose');
const config = require('./config');
const { articleService, Article } = require('./article');

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
// 		console.log('ID', 'URL', 'HEADLINE');
// 		articles.forEach((a) => console.log(a.id, a.url, a.headline));
// 		process.exit(0);
// 	})
// 	.catch((e) => console.log(e));

// Get some articles
Article.findOne({})
	.lean()
	.then((a) => {
		fs.writeFileSync('some-articles.json', JSON.stringify(a));
		process.exit(0);
	})
	.catch((e) => console.log(e));

// Delete all articles
// Article.deleteMany({})
// 	.then((d) => {
// 		console.log(d);
// 		process.exit(0);
// 	})
// 	.catch((e) => console.log(e));
