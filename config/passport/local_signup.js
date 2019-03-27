/**
 * 패스포트 설정 파일
 *
 * 로컬 인증방식에서 회원가입에 사용되는 패스포트 설정
 *
 * @date 2016-11-10
 * @author Mike
 */

var LocalStrategy = require('passport-local').Strategy;

module.exports = new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true    // 이 옵션을 설정하면 아래 콜백 함수의 첫번째 파라미터로 req 객체 전달됨
	}, function(req, email, password, done) {

		console.log('passport의 local-signup 호출됨 : ' + email + ', ' + password);

	    // findOne 메소드가 blocking되지 않도록 하고 싶은 경우, async 방식으로 변경
	    process.nextTick(function() {
	    	var database = req.app.get('database');
		    database.UserModel.findOne({ 'email' :  email }, function(err, user) {
		        // 에러 발생 시
		        if (err) return done(err);

		        // 기존에 사용자 정보가 있는 경우
		        if (user) {
		        	console.log('기존에 계정이 있음.');
		          return done(null, false, req.flash('signupMessage', '계정이 이미 있습니다.'));  // 검증 콜백에서 두 번째 파라미터의 값을 false로 하여 인증 실패한 것으로 처리
		        } else {
		        	// 모델 인스턴스 객체 만들어 저장
		        	var user = new database.UserModel({'email':email, 'password':password});
		        	user.save(function(err) {
		        		if (err) throw err;

								// 회원가입 성공시 세션을 생성 -
								// 만약 세션을 바로 생성하지 않고 로그인 페이지로 리다이렉트 할거면
								// done(null, user)의 user를 null false로 바꾸고 user_passport의 signup 라우팅 함수에서
								// failureRedirect 패스를 바꾸되, 회원가입 실패와 구분해야 핳기 때문에 별도의 처리 필요.
		        	  console.log("사용자 데이터 추가함.");
		        	  return done(null, user);
		        	});
		        }
		    });
	    });
	});
