const router = require('express').Router();
const jwt = require('jsonwebtoken');
var User =  require('../database/user_model')



router.psot('signup', (req, res) => {
	if (!User)	return res.status(500).json({success:false, message:'db failure'});
	var email = req.body.email;
	var password = req.body.password;
	
	User.findOne({email: email}, (err, user))
})



router.post('/login', (req, res, next) => { 
	const { email, password } = req.body
	
	// user 정보 확인하고 jwt 생성
	const check (user) => {
		if (!user) {
			throw new Error('login failed');
		} else {
			// user가 존재한다면 password check
			if (user.verify)
		}
	}
	
})





router.get('/list', (req, res, next) => {
  if (req.isAuthenticated()) { // 현재 session이 유효한 세션인가?
      // 유효 하므로 다음으로
      return next();
  }
  // 유효하지 않은 경우
  res.status(401).json({message:"정상적인 접근이 아닙니다."});}, (req, res) => {
	console.log('user 모듈 안에 있는 listuser 호출됨.');

	// 데이터베이스 객체 참조
	var database = req.app.get('database');
    
    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database.db) {
		// 1. 모든 사용자 검색
		database.UserModel.findAll(function(err, results) {
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                return res.status(500).json({error:'사용자 리스트 조회 중 에러 발생'});
            }

			if (results) {
				console.dir(results);
				/*
				res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
				res.write(JSON.stringify(results));
				res.end();
				*/
				res.status(200).json(results);
				
			} else {
				res.status(404).json({ error: '사용자 리스트 조회 실패' });
			}
		});
	} else {
		res.status(500).json({ error: '데이터베이스 연결 실패' });
	}
	
});








module.exports = router;
