const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
	fullname: {
		type: String,
		trim: true,
	},
	address: {
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
		createIndexes: { unique: true },
	},
	password: {
		type: String,
		trim: true,
	},
	access: {
		type: Boolean,
		default: false,
	},
	incart:[String],

});



module.exports = mongoose.model('Registration', registrationSchema);

