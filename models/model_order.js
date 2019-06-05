const mongoose = require('mongoose');

OrderSchema = mongoose.Schema({
  orderId: {type:String},
  userId: {type:String},
  cafeId: {type:String},
	cafeName: {type:String},
  orderNo: {type:Number},     
  totalPrice: {type: Number},
	contents: {type:Array},
	confirmed: {type:Booliean, default: false},
	accepted: {type:Boolean, default: false},
	canceled: {type:Boolean, default: false},
	created_at: {type:Date, default: Date.now},
  updated_at: {type:Date, default: Date.now}
});


// 각 상품 가격의 합이 전체 가격과 같은지 검사
OrderSchema.path('totalPrice').validate(() => {
  var order = this;
  for (var i in order.contents) {
    var priceSum = 0;
    priceSum += order.contents[i].itemPrice;
  }
  
  if (order.totalPrice != priceSum) 
    order.invalidate('totalPrice', 'totalPrice doesn\'t coincide with the sumation of each item price');
});


module.exports = mongoose.model('order', OrderSchema); 

