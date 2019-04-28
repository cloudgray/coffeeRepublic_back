const mongoose = require('mongoose');

OrderSchema = mongoose.Schema({
  orderId: {type:String},
  userId: {type:String},
  cafeId: {type:String},
  orderNum: {type:Number, default:0},         // {coffeeshopId:String, myNum:Number}
  totalPrice: {type: Number, default:0},
	contents: [{itemName:String, itemPrice:Number}],
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

