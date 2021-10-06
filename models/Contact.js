const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
	},
	description: {
		type: String,
		trim: true,
	},
	phone: {
		type: String,
		trim: true,
	},
	email: {
		type: String,
		trim: true,
	},
	address: {
		type: String,
		trim: true,
	},
	affiliation: {
		type: String,
		trim: true,
	},

});


module.exports = mongoose.model('Contact', contactSchema);
