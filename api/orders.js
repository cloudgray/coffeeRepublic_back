var router = require('express').Router();
const randomstring = require('randomstring');
const util = require('../util');
const Cafe = require('../models/model_cafe');
const User = require('../models/model_user');
const Item = require('../models/model_item');
const Receipt = require('../models/model_receipt');
const Order = require('../models/model_order');
const Device = require('../models/model_device');



// 주문하기
// 푸시 알림 관련하여 추가 구현 필요
router.post('/api/orders', util.isLoggedin, (req, res) => {
  console.log('POST /api/orders called');
      
  // 카페의 직원들 중 현재 일하고 있는 직원들의 단말 정보만 가져온다
  User.find({myOwnCafeId:req.body.cafeId, isWorking:true}, (err, staffs) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!staffs) return res.status(200).json(util.successFalse(null, '현재 예약주문이 불가능합니다.'));

    

    var newOrder = new Order(req.body);
    newOrder.orderNum = cafe.pendingOrders.length + 1;
    newOrder.save((err, order) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!order) return res.status(404).json(util.successFalse(null, '다시 시도해주세요.'));

      cafe.pendingOrders.push({order.orderId});

      // 현재 근무중인 카페 직원들의 단말로 알림 보내기      
      var availDeviceIds = [];
      for (var i in staffs) {
        availDeviceIds.push(staffs[i].deviceId);
      }

      Device.find({ deviceId: {$in: availDeviceIds}})
      .select({regId:1})
      .exec((err, devices) => {

        if (devices.length < 1) {
					console.info('푸시 전송 대상 없음 : ' + regIds.length);
					return res.status(404).json({util.successFalse(null, '푸시 전송 대상 없음.')});
				}
      });

      res.status(200).json({successTrue(order)});
    });
  });
});


// 주문 수락/거부하기
router.put('/api/orders', (req, res) => {
  
});


// 쿠폰 사용하기
router.put('/api/orders/usecoupons', (req, res) => {
  
});


// 현재 진생죽인 주문정보 가져오기(유저)
router.put('/api/orders/usecoupons', (req, res) => {
  
});


// 주문 수락/거부하기
router.put('/api/orders/usecoupons', (req, res) => {
  
});


// 주문 수락/거부하기
router.put('/api/orders/usecoupons', (req, res) => {
  
});