var mongoose = require('mongoose');


// 스키마 정의
var ItemSchema = mongoose.Schema({
  itemId:{type:String, default:''},
  cafeId: {type: String, default:''},
	name: {type: String, index: 'hashed', 'default':''},
	price: {type: String, 'default':''},
  options: {type: Object, default:{}},
	created_at: {type: Date, index: {unique: false}, 'default': Date.now},
	updated_at: {type: Date, index: {unique: false}, 'default': Date.now}
});


//
// 필요한 메소드 정의
//


// 모델을 위한 스키마 등록
mongoose.model('Item', ItemSchema);



// module.exports에 UserSchema 객체 직접 할당
module.exports = mongoose.model('item', ItemSchema);
