const router = require('express').Router();
const util = require('./util');
const Receipt = require('../models/model_receipt');

/*
*
* 나중에 구매 내역에 페이지 번호를 매겨야 할듯?
*
*/


// 구매내역 가져오기 (유저)
router.get('/api/receipts/:userId', util.isLoggedin, (req, res) => {
  console.log('GET /api/receipts/:userId called');
  // db에서 해당 userId 값을 가진 영수증 목록을 검색하여 클라이언트로 전달
  Receipt.find({userId:req.params.coffeeshopId}, (err, receipts) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!receipts) return res.status(404).json(util.successFalse(null, '구매내역이 존재하지 않습니다.'));
    res.status(200).json(util.successTrue(receipts));
    console.dir(receipts);
  });
});


// 구매내역 가져오기 (카페 사장/알바)
router.get('/api/receipts/:coffeeshopId', (req, res) => {
  console.log('GET /api/receipts/:coffeeshopId called');
  // db에서 해당 coffeeshopId 값을 가진 영수증 목록을 검색하여 클라이언트로 전달
  Receipt.find({userId:req.params.coffeeshopId}, (err, receipts) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!receipts) return res.status(404).json(util.successFalse(null, '구매내역이 존재하지 않습니다.'));
    res.status(200).json(util.successTrue(receipts));
    console.dir(receipts);
  });
});










