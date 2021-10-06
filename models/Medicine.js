const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true,
	},
	desc: {
		type: String,
		trim: true,
	},
	company: {
		type: String,
		trim: true,
	},
	baseunit: {
		type: Number,
		trim: true,
	},
	baseprice: {
		type: Number,
		trim: true,
	},
	category: {
		type: String,
		trim: true,
	},
	img: {
		data: Buffer,
		contentType: String
	},

});


module.exports = mongoose.model('Medicine', medicineSchema);

