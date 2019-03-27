module.exports = function(router, passport) {
  console.log('user_passport 호출됨.');

  // 홈 화면
  router.route('/').get(function(req, res) {
    console.log('/ 패스 요청됨.');

    console.log('req.user의 정보');
    console.dir(req.user);

    // 인증 안된 경우
    if (!req.user) {
      console.log('사용자 인증 안된 상태.');
      res.status(200).json({
        success: false,
        message: '사용자 인증 안된 상태'
      });
    } else {
      console.log('사용자 인증된 상태.');
      res.status(200).json({
        success: true,
        message: '사용자 인증된 상태'
      });
    }
  });

  // 로그아웃
  router.route('/logout').get(function(req, res) {
    console.log('/logout 패스 요청됨.');
    req.logout();
    res.redirect('/');
  });

  router.get('/login', (req, res) => {
    res.status(200).json({message:'로그인 페이지'});
  });

  // 로그인 인증
  router.route('/login').post(passport.authenticate('local-login', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  }));


  router.get('/signup', (req, res) => {
    var fmsg = req.flash('signupMessage');
    if (fmsg !== '') {   // 회원가입 실패시 회원가입 페이지로 리다이렉트, flash message를 클라이언트에 전송
      console.log('flash message : ' + fmsg);
      return res.status(200).json({message:fmsg});
    }
    res.status(200).json({message:'회원가입 페이지'});

  });

  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  // 패스포트 - 페이스북 인증 라우팅
  router.route('/auth/facebook').get(passport.authenticate('facebook', {
    scope: 'email'
  }));

  // 패스포트 - 페이스북 인증 콜백 라우팅
  router.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
    successRedirect: '/profile',
    failureRedirect: '/'
  }));

};
