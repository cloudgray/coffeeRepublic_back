var router = require('express').Router();
const randomstring = require('randomstring');
const User = require('../models/model_user');
const Cafe = require('../models/model_cafe');
const Item = require('../models/model_item');
const config = require('../config/config');
const util = require('../util');


// 회원가입
// 닉네임 중복검사 아직 안 만듦
router.post('/', (req, res, next) => {
	console.log('POST /api/users 호출됨');
  if (!req.body.email || !req.body.nickname || !req.body.password) 
    return res.status(400).json(util.successFalse(null, 'email/nickname/password required'));

	User.findOne({
		email: req.body.email
	}, (err, user) => {
		if (err) return res.status(500).json(util.successFalse(err));
		if (user) return res.status(404).json(util.successFalse(null, 'user already exists'));
		var newUser = new User(req.body);
    newUser.userId = randomstring.generate(16);
		
		newUser.save((err, user) => {
			res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
		});
	});
});

// staff signup
// 닉네임 중복검사 아직 안 만듦
router.post('/staffs', (req, res, next) => {
	console.log('POST /api/users 호출됨');
	User.findOne({
		email: req.body.email
	}, (err, user) => {
		if (err) return res.status(400).json(util.successFalse(err));
		if (user) {
      user.isStaff = true;        // 이미 어플을 사용하던 유저가 카페 알바로 취직했을 경우 staff 권한 획득
      user.save((err, user) => {
        if (err) return res.status(500).json(util.successFalse(err));
        res.status(200).json(util.successTrue(user));
      });
    }
		var newUser = new User(req.body);
    newUser.userId = randomstring.generate(16);
		
		newUser.save((err, user) => {
			res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
		});
	});
});

// 카페 알바로 등록


// 출근 -> user.isWorking = true 주문 알림이 뜨기 시작


// 퇴근 -> user.isWorking = true 주문 알림을 받지 않음


// 내 정보 조회
router.get('/me', util.isLoggedin, (req,res,next) => {
    User.findOne({userId:req.decoded.userId})
    .exec(function(err,user){
      if(err||!user) return res.json(util.successFalse(err));
      res.json(util.successTrue(user));
    });
  }
);


// 비밀번호 변경 - deprecated
router.put('/password', util.isLoggedin, checkPermission, (req, res, next) => {
	User.findOne({userId:req.decoded.userId}).select({password:1}).exec((err, user) => {
		if (err) return res.status(500).json(util.successFalse(err));

		// update user object
		user.originalPassword = user.password;            //해시값
		user.password = req.body.newPassword ? req.body.newPassword : user.password;
    
		for (var p in req.body) {
			user[p] = req.body[p];
		}
    
    user.updated_at = Date.now();  
    
		// save updated user
		user.save((err, user) => {
			if (err || !user) return res.status(500).json(util.successFalse(err));
			user.password = undefined;
			res.json(util.successTrue(user));
		});
	});
});


// 회원탈퇴
router.delete('/me', util.isLoggedin, checkPermission, (req, res, next) => {
	User.findOneAndRemove({userId:req.decoded.userId})
		.exec((err, user) => {
			res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
		});
});

// myCafe 목록 가져오기
router.get('/mycafes', util.isLoggedin, (req, res) => {
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Cafe.find({cafeId: {$in: user.myCafeIds}}, (err, cafes) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!cafes) return res.status(404).json(util.successFalse(null, '등록된 마이카페가 없습니다.'));
      
      res.status(200).json(util.successTrue(cafes));
    });
  });
});

// myCafe 목록에 카페 추가
router.put('/mycafes/:cafeId', util.isLoggedin, (req, res) => {
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!cafe) return res.status(404).json(util.successFalse(null, '이용할 수 없는 카페입니다.'));
      if (user.myCafeIds.includes(cafe.cafeId)) return res.status(400).json(util.successFalse('이미 등록된 카페입니다.'));
      
      user.myCafeIds.push(req.params.cafeId);
      user.save()
          .then(user => res.status(200).json(util.successTrue(user.myCafeIds)))
          .catch(err => res.status(500).json(util.successFalse(err)));
      
    });
  });
});

// myCafe 목록에서 카페 제거
router.delete('/mycafes/:cafeId', util.isLoggedin, (req, res) => {  
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!cafe) return res.status(404).json(util.successFalse(null, '이용할 수 없는 카페입니다.'));
      if (!user.myCafeIds.includes(cafe.cafeId)) return res.status(400).json(util.successFalse('등록지 않은 카페입니다.'));
      
      user.myCafeIds.splice(user.myCafeIds.indexOf(cafe.cafeId), 1);
      user.save()
          .then(user => res.status(200).json(util.successTrue(user.myCafeIds)))
          .catch(err => res.status(500).json(util.successFalse(err)));
      
    });
  });
});

// myCafeMenu 목록 가져오기
router.get('/myitems', util.isLoggedin, (req, res) => {
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Cafe.find({cafeId: {$in: user.myItemIds}}, (err, items) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!items) return res.status(404).json(util.successFalse(null, '등록된 마이카페메뉴가 없습니다.'));
      
      res.status(200).json(util.successTrue(user.myItemIds));
    });
  });
});

// 메인 화면에 표시될 myCafeMenu 목록에 메뉴 추가
router.put('/myitems/:itemId', util.isLoggedin, (req, res) => {
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Item.findOne({itemId:req.params.itemId}, (err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!item) return res.status(404).json(util.successFalse(null, '존재하지 않는 메뉴입니다.'));
      if (user.myItemIds.includes(item.itemId)) 
        return res.status(400).json(util.successFalse(null, '이미 등록된 메뉴입니다.'));
      
      user.myItemIds.push(item.itemId);
      user.save()
          .then(user => res.status(200).json(util.successTrue(user.myItemIds)))
          .catch(err => res.status(500).json(util.successFalse(err)));
    });
  });
});

// 메인 화면에 표시될 myCafeMenu 목록에서 메뉴 삭제
router.delete('/myitems/:itemId', util.isLoggedin, (req, res) => {
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!user) return res.status(404).json(util.successFalse(null, '등록되지 않은 사용자입니다.'));
    
    Item.findOne({itemId:req.params.itemId}, (err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!item) return res.status(404).json(util.successFalse(null, '존재하지 않는 메뉴입니다.'));
      if (!user.myItemIds.includes(item.itemId)) 
        return res.status(400).json(util.successFalse(null, '등록되지 않은 메뉴입니다.'));
      
      user.myItemIds.splice(user.myItemIds.indexOf(item.itemId), 1);
      user.save()
          .then(user => res.status(200).json(util.successTrue(user.myItemIds)))
          .catch(err => res.status(500).json(util.successFalse(err)));
    });
  });
});


// private functions
function checkPermission(req, res, next) {
	User.findOne({
		userId: req.decoded.userId
	}, (err, user) => {
		if (err || !user) return res.json(util.successFalse(err));
		else if (!req.decoded || user.userId != req.decoded.userId)
			return res.json(util.successFalse(null, 'You don\'t have permission'));
		else next();
	});
}

module.exports = router;
