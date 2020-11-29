const mongoose = require('mongoose');

// Create the article model for the database
const articleSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	headline: String,
	body: String,
	pos_tags: [],
});

module.exports = mongoose.model('Article', articleSchema);
