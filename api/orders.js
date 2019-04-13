const router = require('express').Router();
const randomstring = require('randomstring');
const util = require('../util');
const Item = require('../models/model_item');
const Receipt = require('../models/model_receipt');
const PendingOrder = require('../models/model_pendingOrder');

// 주문하기
router.post('/api/orders', (req, res) => {
  console.log('POST /api/orders called');
  
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