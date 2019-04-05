var mongoose = require('mongoose');

var CouponSchema = mongoose.Schema({
	coffeeshopId: {type: String, default:''},
	userId: {type:String, default:''},
	amount: {type: Number, default:0}		
});

module.exports = mongoose.model('coupon', CouponSchema);