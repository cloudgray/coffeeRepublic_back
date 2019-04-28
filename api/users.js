var router = require('express').Router();
var User = require('../models/model_user');
var config = require('../config/config');
var util = require('../util');


// 회원가입
// 닉네임 중복검사 아직 안 만듦
router.post('/', (req, res, next) => {
	console.log('POST /api/users 호출됨');
	User.findOne({
		email: req.body.email
	}, (err, user) => {
		if (err) return res.status(500).json(util.successFalse(err));
		if (user) return res.status(404).json(util.successFalse(null, 'user already exists'));
		var newUser = new User(req.body);
		
		newUser.save((err, user) => {
			res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
		});
	});
});

// 내 정보 조회
router.get('/me', util.isLoggedin, (req,res,next) => {
    User.findById(req.decoded._id)
    .exec((err,user) => {
      if(err||!user) return res.json(util.successFalse(err));
      res.json(util.successTrue(user));
    });
  }
);

// 비밀번호 변경
router.put('/password', util.isLoggedin, checkPermission, (req, res, next) => {
	User.findById(req.decoded._id, (err, user) => {
		if (err || !user) return res.json(util.successFalse(err));

		// update user object
		user.originalPassword = user.password;
		user.password = req.body.newPassword ? req.body.newPassword : user.password;
		user.updated_at = Date.now;
		/*
		for (var p in req.body) {
			user[p] = req.body[p];
		}
		*/
		// save updated user
		user.save((err, user) => {
			if (err || !user) return res.json(util.successFalse(err));
			user.password = undefined;
			res.json(util.successTrue(user));
		});
	});
});

// 회원탈퇴
router.delete('/me', util.isLoggedin, checkPermission, (req, res, next) => {
	User.findOneAndRemove({_id:req.decoded._id})
		.exec((err, user) => {
			res.json(err || !user ? util.successFalse(err) : util.successTrue(user));
		});
});


// private functions
function checkPermission(req, res, next) {
	User.findOne({
		_id: req.decoded._id
	}, (err, user) => {
		if (err || !user) return res.json(util.successFalse(err));
		else if (!req.decoded || user._id != req.decoded._id)
			return res.json(util.successFalse(null, 'You don\'t have permission'));
		else next();
	});
}

module.exports = router;
