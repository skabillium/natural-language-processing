const mongoose = require('mongoose');

// Create the article model for mongoose
const articleSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	url: String,
	headline: String,
	summary: String,
	body: String,
	postags: [],
});

module.exports = mongoose.model('Article', articleSchema);
