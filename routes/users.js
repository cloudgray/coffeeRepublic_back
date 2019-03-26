const router = require('express').Router();

router.get('/list', (req, res) => {
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
