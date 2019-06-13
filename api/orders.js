var router = require('express').Router();
const fcm = require('node-gcm');
const randomstring = require('randomstring');
const config = require('../config/config');
const util = require('../util');
const Cafe = require('../models/model_cafe');
const User = require('../models/model_user');
const Item = require('../models/model_item');
const Order = require('../models/model_order');
const moment = require('moment');



// { 카페 아이디 : 주문 큐 } - 전역변수로 사용하기 위해 util.js 에 빈 객체 하나 만들어둠
var queues = util.queues;

// 주문하기
// 푸시 알림 관련하여 추가 구현 필요
router.post('/:cafeId', util.isLoggedin, (req, res) => {	
	Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
		if (err||!cafe) return res.status(500).json(util.successFalse(err));
		
		User.find({myOwnCafeId:req.body.cafeId, isWorking:true}, (err, staffs) => {
			if (err) return res.status(500).json(util.successFalse(err));
			if (!staffs) return res.status(200).json(util.successFalse(null, '현재 예약주문이 불가능합니다.'));

			if (!queues[req.params.cafeId]){
				queues[req.params.cafeId] = {
					nextOrderNo: 1,
					pendingOrders: []
				}
			}
			
			// 주문 객체 생성			
			var order = {};
			order.desiredTime = req.body.desiredTime;
			order.contents = req.body.contents;
			order.totalPrice = req.body.totalPrice;
			order.useCoupon = req.body.useCoupon;
			
			order.orderId = randomstring.generate(16);
			order.userId = req.decoded.userId;
			order.cafeId = req.params.cafeId;
			order.cafeName = cafe.name;
			order.orderNo = queues[req.params.cafeId].nextOrderNo++;

			// 주문큐에 주문 객체 push
			// queues[req.params.cafeId].pendingOrders.push(order);
			insertOrder(queues[req.params.cafeId].pendingOrders, order);
			const myTurn = queues[req.params.cafeId].pendingOrders.length;


			// 카페 직원한테 보낼 메세지 생성, 전송
			var message = new fcm.Message({
				priority: 'high',
				timeToLive: 10
			});
			message.addData('command', 'show');
			message.addData('type', 'application/json');
			message.addData('data', order);

			for (var i in staffs) {
				sender.send(message, staffs[i].fcmToken, (err, result) => {
					if (err) return res.status(500).json(util.successFalse(err));
					console.log('주문 들어갑니다~ \n' + order);
				});
			}
		
			// 손님 client에게는 예상 시간을 보내줘야
			var now = moment();
			var pickupTime = moment(order.desiredTime, "HH:mm");
			if (now.add(myTurn * 1, "minutes") > pickupTime) {
				pickupTime = now;
			} 
			var data = {
				orderId: order.orderId,
				contents: order.contents,
				orderNo: order.orderNo,
				myTurn: myTurn,
				pickupTime: pickupTime.hour().format("HH") + ":" + pickupTime.minute().format("mm")
			}
			res.status(200).json(util.successTrue(data));
		});
	});
});


// 주문 확정하기 (손님) 
router.post('/:cafeId/:orderId', util.isLoggedin, (req, res) => {
	var pendingOrders = queues[req.params.cafeId].pendingOrders; 
	
	for (var i in pendingOrders) {
    if (pendingOrders[i].orderId == req.params.orderId) {
			var order = pendingOrders[i];
			order.confirmed = req.body.confirmed;
			
			if (!pendingOrders[i].confirmed) 
				return res.status(200).json(util.successTrue());
			res.status(200).json(util.successTrue('confirmed'));
			
			var orderHistory = new Order();
			for (var p in order) {
				orderHistory[p] = order[p];
			}
			
			// 영수증 저장
			orderHistory.save()
				.exec(receipt => res.status(200).json(util.successTrue(receipt)))
				.catch(err => res.status(500).json(util.successFalse(err)));
			
			return;
		}  
  }
});


// 주문 수락하기 (카페)
router.put('/:cafeId/:orderId', util.isLoggedin, util.isStaff, (req, res) => { 
  var pendingOrders = queues[req.params.cafeId].pendingOrders;
	var order = {};
	for (var i in pendingOrders) {
    if (pendingOrders[i].orderId == req.params.orderId) {
			pendingOrders[i].accepted = req.body.accepted;
			order = pendingOrders[i];
			break;
		}
	}

	// 손님에게 주문이 수락되었음을 알림
	var message = new fcm.Message({
		priority: 'high',
		timeToLive: 10
	});

	var data = {
		orderId: order.orderId,
		orderNo: order.orderNo,
		pickupTime: order.pickupTime,
		accepted: order.accepted
	};

	message.addData('command', 'show');
	message.addData('type', 'application/json');
	message.addData('data', data);

	User.findOne({userId: order.userId}, (err, user) => {
		sender.send(message, staffs[i].fcmToken, (err, result) => {
			if (err) return res.status(500).json(util.successFalse(err));
			res.status(200).json(util.successTrue(result));
		});
	});
});



/*
* 사장이 메뉴가 완성되었을 때 사용자에게 보내는 푸시 알림
*/
 
router.post('/:userId/test/complete', util.isLoggedin, (req, res) => {
	User.findOne({userId:req.params.userId}, (err, user) => {
		if (err) return res.status(500).json(util.successFalse('설마 이 부분에서 난 에러는 아니겠지'));
		if (!user) return res.status(200).json(util.successFalse('존재하지 않는 사용자입니다.'));
			
		var message = new fcm.Message({
			priority: 'high',
			timeToLive: 10
		});

		var data = {
			msg:"주문하신 아메리카노 ICE가 완성되었습니다!"
		};

		message.addData('command', 'show');
		message.addData('type', 'application/json');
		message.addData('data', data);
		
		// push msg sender
		var sender = new fcm.Sender(config.fcm_api_key);
		
		sender.send(message, user.fcmToken, (err, result) => {
			if (err) return res.status(500).json(util.successFalse(err));
			res.status(200).json(util.successTrue(result));
		});
	});
});



// 현재 진행중인 주문정보 가져오기(유저)
router.get('/:cafeId/myorder', (req, res) => {
  var pendingOrders = queues[req.params.cafeId].pendingOrders;
	for (var i in pendingOrders) {
		if (pendingOrders[i].userId == req.decoded.userId)
			return res.status(200).json(util.successTrue(pendingOrders[i]));
	}
	res.status(404).json(util.successFalse(null, '진행중인 주문내역이 없습니다.'));
});

// 주문 큐 가져오기 (카페)
router.get('/:cafeId/orderlist', util.isLoggedin, util.isStaff, (req, res) => {
	if (queues[req.params.cafeId] == undefined )
		return res.stauts(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'))
	res.status(200).json(queues[req.params.cafeId].pendingOrders);
});


// 주문 취소
router.post('/:cafeId/:orderId/cancel', (req, res) => {
  queues[req.params.cafeId]
});


// 수령 완료
router.post('/:cafeId/:orderId/complete', (req, res) => {
  // 큐에서 빼기
	var pendingOrders = queues[req.params.cafeId].pendingOrders
	var cafeName;
	
	for (var i in pendingOrders) {
		if (pendingOrders[i].orderId == req.params.orderId) {
			cafeName = pendingOrders[i].cafeName;
			queues[req.pamras.cafeId].pendingOrders.splice(i, 1);
		}
	}
	// 쿠폰 발급
	User.findOne({userId: req.decoded.userId}, (err, user) => {		
		if (err) return res.status(500).json(util.successFalse(err));
		if (!user) return res.status(404).json(util.successFalse(null, '회원가입이 필요합니다.'));
		
		// 쿠폰...
		
		
		var coupon = {
			cafeId: req.params.cafeId,
			cafeName: cafeName,
		}
		
		
	});
	
	
});

// 주문을 주문큐에 시간 순서에 맞게 삽입한다.
var insertOrder = function(queue, order) {
	for (var i in queue) {
		if (queue[i].desiredTime < order.desiredTime) {
			queue.splice(i, 0, order);
		}
	}
}














module.exports = router;