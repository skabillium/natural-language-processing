const mongoose = require('mongoose');

// The schema of the stem database model.
const stemSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
});

module.exports = mongoose.model('Stem', stemSchema);
