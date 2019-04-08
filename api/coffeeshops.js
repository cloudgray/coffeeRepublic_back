
const router = require('express').Router();
const randomstring = require('randomstring');
const Coffeeshop = require('../models/model_coffeeshop');
const User = require('../models/model_user');
const util = require('../util');


// 카페 등록 - 스테프로 로그인해야 한다
router.post('/', util.isLoggedin, util.isStaff, (req, res) => {
	console.log('POST api/coffeeshop/register called');
		
	var newCoffeeshop = new Coffeeshop(req.body);
  if (newCoffeeshop.geometry.coordinates[0] > 90) newCoffeeshop.geometry.coordinates[0] -= 90;
  if (newCoffeeshop.geometry.coordinates[1] > 90) newCoffeeshop.geometry.coordinates[1] -= 90;
  newCoffeeshop.coffeeshopId = randomstring.generate(10);
  
	// save()로 저장
	newCoffeeshop.save((err, coffeeshop) => {
		if (err) return res.status(500).json(util.successFalse(err));
		if (!coffeeshop) return res.status(404).json(util.successFalse(null, '커피숍 등록 실패'));
    
    User.findById(req.decoded._id, (err, user) => {
      user.myOwnCafeId = newCoffeeshop._id;   // _id는 db에 저장할 때 자동 생성되는 id 값
      user.save();
    });
    
    res.status(200).json(util.successTrue(coffeeshop));
	});
  
});

// 카페 리스트 가져오기
router.get('/', (req, res) => {
	console.log('GET /api/coffeeshop called');
 
  Coffeeshop.find({"deprecated":false}, (err, coffeeshops) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!coffeeshops) return res.status(404).json(util.successFalse(null, '등록된 카페가 없습니다.'));
    res.status(200).json(util.successTrue(coffeeshops));
  });
	
  /*
  for (var i = 0; i < results.length; i++) {
    var curName = results[i]._doc.name;
    var curAddress = results[i]._doc.address;
    var curTel = results[i]._doc.tel;
    var curLongitude = results[i]._doc.geometry.coordinates[0];
    var curLatitude = results[i]._doc.geometry.coordinates[1];
  }	
  */
  
});

// 가까운 커피숍 10개 조회
router.get('/near', (req, res) => {
	console.log('coffeeshop 모듈 안에 있는 findNear 호출됨.');
  
	var maxDistance = 3000;
  var longitude = req.query.longitude;
  var latitude = req.query.latitude;
	
  console.log('요청 파라미터 : ' + longitude + ', ' + latitude);
		// 가까운 커피숍 10개 검색
  Coffeeshop.findNear(longitude, latitude, maxDistance, 10, (err, coffeeshops) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!coffeeshops) return res.status(404).json(util.successFalse(null, '주변에 예약 주문이 가능한 카페가 없습니다.ㅠㅠ'));
    res.status(200).json(util.successTrue(coffeeshops));
  });
  
});

// 카페 상세정보 가져오기
router.get('/:coffeeshopId', (req, res) => {
  console.log('GET /:coffeeshopId called');
  Coffeeshop.findById(req.params.coffeeshopId, (err, coffeeshop) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!coffeeshop) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    res.status(200).json(util.successTrue(coffeeshop));
  });
});


// 카페 정보 수정
router.put('/:coffeeshopId', util.isLoggedin, util.isStaff, (req, res) => {
  console.log('PUT /:coffeeshopId called');
  Coffeeshop.findById(req.params.coffeeshopId, (err, coffeshop) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!coffeeshop) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    for (var p in req.body) {
			coffeeshop[p] = req.body[p];
		}
    coffeeshop.updated_at = Date.now;
    coffeeshop.save((err, coffeeshop) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 정보 수정 실패'));
      res.status(200).json(util.successTrue(coffeeshop));
    }); 
  });
});


// 카페 탈퇴
router.put('/:coffeeshopId/unregister', util.isLoggedin, util.isOwner, (req, res) => {
  console.log('PUT /:coffeeshopId/unregister called');
  Coffeeshop.findById(req.params.coffeeshopId, (err, coffeshop) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!coffeeshop) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    coffeeshop.deprecated = true;
    coffeeshop.updated_at = Date.now;
    coffeeshop.save((err, coffeeshop) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 탈퇴 실패'));
      res.status(200).json(util.successTrue(coffeeshop));
    }); 
  });
});





module.exports = router;