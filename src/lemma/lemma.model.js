const mongoose = require('mongoose');

// The schema of the lemma database model.
const lemmaSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
	appearances: Number,
	articles: {},
});

module.exports = mongoose.model('Lemma', lemmaSchema);
