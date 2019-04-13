const mongoose = require('mongoose');

OrderSchema = mongoose.Schema({
  userId: {type:String},
  coffeeshopId: {type:String},
  orderId: {type:String},
  orderNum: {type:Object, default:{}},         // {coffeeshopId:String, myNum:Number}
  totalPrice: {type: Number, default:0},
	contents: [
    {
      itemName:{type:String}, 
      itemPrice:{type:Number}
    }
  ],
	canceled:{type:Boolean, default: false},
	created_at: {type:Date, default: Date.now},
  updated_at: {type:Date, default: Date.now}
});


//
// 필요한 메소드 정의
//


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



// 입력된 칼럼의 값이 있는지 확인 
DeviceSchema.path('mobile').validate(function (mobile) {
	return mobile.length;
}, 'mobile 칼럼의 값이 없습니다.');







module.exports = mongoose.model('order', OrderSchema); 

