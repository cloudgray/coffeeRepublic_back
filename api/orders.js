var router = require('express').Router();
const fcm = require('node-gcm');
const Queue = require('better-queue');
const randomstring = require('randomstring');
const util = require('../util');
const Cafe = require('../models/model_cafe');
const User = require('../models/model_user');
const Item = require('../models/model_item');
const Receipt = require('../models/model_receipt');
const Order = require('../models/model_order');
const Device = require('../models/model_device');


var sender = new fcm.Sender(config.fcm_api_key);

var queues = [];
Cafe.find({deprecated:false}, (err, cafes) => {
  for (var i in cafes) {
    var orderQueue = {
      cafeId: cafes[i].cafeId,
      nextOrderNo: 1,
      pendingOrders: []
    }
    
    queues.push(orderQueue);
  }
})

// 주문하기
// 푸시 알림 관련하여 추가 구현 필요
router.post('/:cafeId', util.isLoggedin, (req, res) => {
  User.find({myOwnCafeId:req.body.cafeId, isWorking:true}, (err, staffs) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!staffs) return res.status(200).json(util.successFalse(null, '현재 예약주문이 불가능합니다.'));

    // 주문 큐 
    for (var i in queues) {
      if (queues[i].cafeId == req.params.cafeId) 
        var pendingOrders = queues[i].pendingOrders;
    }
    
    // 주문 객체 생성
    var order = req.body;
    order.orderId = randomstring.generate(16);
    order.userId = req.decoded.userId;
    order.orderNo = pendingOrders.nextOrderNo++;
    order.canceled = false;
    order.created_at = Date.now();
    order.updated_at = Date.now();
    pendingOrders.push(order);
    
    
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
  });
});


// 주문 수락/거부하기
router.put('/:cafeId/:orderId', util.isLoggedin, util.isStaff, (req, res) => { 
  for (var i in queues) {
    if (queues[i].cafeId == req.params.cafeId) 
      var pendingOrders = queues[i].pendingOrders;
  }
	
	for (var i in pendingOrders) {
    if (pendingOrders[i].orderId == req.params.orderId) {
			var order = pendingOrders[i];
			order.accept = req.body.accept;
			
			if (!pendingOrders[i].accept) 
				res.status(200).json(util.successTrue('rejected'));
			res.status(200).json(util.successTrue('accepted'));
			
			// 영수증 저장
			var newReceipt = new Receipt();
			for (var p in order) {
				newReceipt[p] = order[p];
			}
			newReceipt.save()
				.exec(receipt => res.status(200).json(util.successTrue(receipt)))
				.catch(err => res.status(500).json(util.successFalse(err)));
			
			return;
		}  
  }	
});


// 현재 진행중인 주문정보 가져오기(유저)
router.get('/api/orders/:cafeId/myorder', (req, res) => {
  for (var i in queues) {
    if (queues[i].cafeId == req.params.cafeId) 
      var pendingOrders = queues[i].pendingOrders;
  }
	
	for (var i in pendingOrders) {
    if (pendingOrders[i].orderId == req.params.orderId) {
			var order = pendingOrders[i];
			res.status(200).json(util.successTrue(order));
			return;
		}
	}
	res.status(404).json(util.successFalse(null, '진행중인 주문내역이 없습니다.'));
});

// 주문 큐 가져오기 (카페)
router.get('/api/orders/:cafeId/myorder', (req, res) => {
  for (var i in queues) {
    if (queues[i].cafeId == req.params.cafeId) {
			var pendingOrders = queues[i].pendingOrders;
			res.status(200).json(util.successTrue(pendingOrders));
			return;
		}
  }
});


// 주문 취소
router.post('/cancel', (req, res) => {
  
});


// 수령 완료
router.put('/orders', (req, res) => {
  
});