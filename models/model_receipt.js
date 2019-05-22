var mongoose = require('mongoose');

var ReceiptSchema = mongoose.Schema({
	cafeId: {type:String},
	userId : {type:String},
  orderId: {type:String},
  receiptId: {type:String},
	totalPrice: {type: Number, default:0},
	contents: [{itemName:String, itemPrice:Number}],
  canceled: {type:Boolean, default: false},
	created_at: {type:Date, default: Date.now},
  updated_at: {type:Date, default: Date.now}
});


//
// 필요한 메소드 정의
//


module.exports = mongoose.model('receipt', ReceiptSchema);