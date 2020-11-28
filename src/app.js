const mongoose = require('mongoose');
const config = require('./config');
const { articleService } = require('./article');

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

// articleService
// 	.get_articles()
// 	.then((a) => fs.writeFileSync('article.json', JSON.stringify(a)))
// 	.catch((e) => console.log(e));
