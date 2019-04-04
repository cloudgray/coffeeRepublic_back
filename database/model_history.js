var mongoose = require('mongoose');
Schema = mongoose.Schema;

var HistorySchema = new Schema({
	coffeeshopId: {type:String, default:''}
	, userId : {type: String}
	, totalPrice: {type: Number, default:0}
	, contents: {type: Array, default:[]}
	, created_at: {type:Date, default: Date.now()}
});


//
// 필요한 메소드 정의
//





module.exports = mongoose.model('history', HistorySchema);