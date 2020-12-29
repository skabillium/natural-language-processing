const mongoose = require('mongoose');

// The schema of the document database model.
const documentSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	category: String,
	text: String,
	stems: [],
	tfidf_vector: [],
});

module.exports = mongoose.model('Document', documentSchema);
