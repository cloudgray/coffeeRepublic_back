var router = require('express').Router();
const randomstring = require("randomstring");
const util = require('../util');
const Coffeeshop = require('../models/model_coffeeshop');
const Item = require('../models/model_item');


// 메뉴 목록 가져오기
router.get('/', (req, res) => {
  Item.find({coffeeshopId:req.body.coffeeshopId}, (err, items) => {
    if (err) return res.status(400).json(util.successFalse(err));
    if (!items) return res.status(404).json(util.successFalse(null, '등록된 메뉴가 없습니다.'));
    res.status(200).json(util.successTrue(items));
    console.dir(items);
  });
});

// 메뉴 등록
router.post('/', util.isLoggedin, util.isStaff, (req, res) => {
  Item.findOne({name:req.body.name}, (err, item) => {
    if (err) return res.status(400).json(util.successFalse(err));
    if (item) return res.status(404).json(util.successFalse(null, '이미 등록된 메뉴입니다.'));
    var newItem = new Item(req.body);
    newItem.save((err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      res.status(200).json(util.successTrue(item));
      console.dir('메뉴 등록 성공: ' + item);
    });
  });
});

// 메뉴 수정
router.put('/:itemId', util.isLoggedin, util.isStaff, (req, res) => {
  Item.findById(req.params.itemId, (err, item) => {
    if (err) return res.status(400).json(util.successFalse(err));
    if (!item) return res.status(404).json(util.successFalse(null, '일치하는 메뉴가 없습니다.'));
    for (var p in req.body) {
			item[p] = req.body[p];
		}
    item.updated_at = Date.now();
    item.save((err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      res.status(200).json(util.successTrue(item));
      console.dir('메뉴 수정 성공: ' + item);
    })
  });
});

router.delete('/:itemId', util.isLoggedin, util.isStaff, (req, res) => {
  Item.findOneAndDelete({_id:req.body.itemId}, (err, item) => {
    if (err) return res.status(400).json(util.successFalse(err));
    if (!item) return res.status(404).json(util.successFalse(null, '존재하지 않는 메뉴입니다.'));
    res.status(200).json(util.successTrue(item));
  })
})


module.exports = router;
