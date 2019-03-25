/*
 * 사용자 조회를 담당하는 라우팅 함수 정의
 *
 * @date 2016-11-10
 * @author Mike *
 */

var listuser = function(req, res) {
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
	
};


var adduser = function(req, res) {
	console.log('user(user.js) 모듈 안에 있는 adduser 호출됨.');
	var email = req.body.email;
    var password = req.body.password;
    console.log('요청 파라미터 : ' + email + ', ' + password);
    
    // 데이터베이스 객체 참조
	var database = req.app.get('database');
	
    // 데이터베이스 객체가 초기화된 경우 사용자 추가
	if (database.db) {		
		database.UserModel.findOne({email : email}, (err, user) => {	// email 중복 체크
			if(err) return res.status(500).json({ error: '사용자 추가 중 에러 발생' });
			if(user) return res.status(404).json({ error: '이미 가입된 이메일입니다.' });

			var add_user = new database.UserModel({email:email, password:password});
			console.dir(add_user);
			
			add_user.save()
				.then(result => res.status(200).json({ success: true }))
				.catch(err => console.log(err));
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.status(500).json({ error: '데이터베이스 연결 실패' });
	}
};



module.exports.listuser = listuser;
module.exports.adduser = adduser;
