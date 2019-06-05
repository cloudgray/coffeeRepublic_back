var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReviewSchema = new Schema({
	reviewId: {type: String},
	cafeId: {type: String},
	userId: {type: String},
	nickname: {type: String},
	content: {type: String},
	rating: {type: Number, default : 0},
	up: {type: Number, default : 0},
	created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
});

module.exports = mongoose.model('review',ReviewSchema);