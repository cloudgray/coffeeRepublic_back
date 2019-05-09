var mongoose = require('mongoose');


// 스키마 정의
var ItemSchema = mongoose.Schema({
  itemId: {type: String},
  cafeId: {type: String},
  imagePath: {type: String},
	name: {type: String},
	price: {type: Number},
  options: {type: Object, default:{}},
	created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
});



// module.exports에 UserSchema 객체 직접 할당
module.exports = mongoose.model('item', ItemSchema);
