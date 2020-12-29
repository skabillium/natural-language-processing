const mongoose = require('mongoose');

// Create the Stem model for the database
const stemSchema = mongoose.Schema({
	_id: mongoose.Schema.Types.ObjectId,
	name: String,
});

module.exports = mongoose.model('Stem', stemSchema);
