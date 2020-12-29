const mongoose = require('mongoose');

// Create the Document model for the database
const documentSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	category: String,
	text: String,
	stems: [],
	tfidf_vector: [],
});

module.exports = mongoose.model('Document', documentSchema);
