const mongoose = require('mongoose');

// The schema of the article database model.
const articleSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	headline: String,
	body: String,
	pos_tags: [],
});

module.exports = mongoose.model('Article', articleSchema);
