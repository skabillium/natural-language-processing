const mongoose = require('mongoose');

// Create the lemma model for the database
const lemmaSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	appearances: Number,
	articles: {},
});

module.exports = mongoose.model('Lemma', lemmaSchema);
