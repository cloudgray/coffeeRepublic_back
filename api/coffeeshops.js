
const router = require('express').Router();
var Coffeeshop = require('../models/model_coffeeshop');


router.post('/register', (req, res) => {
	console.log('POST api/coffeeshop/register called');
	
	
		
	var coffeeshop = new Coffeeshop({ 
		name:req.body.name, 
		address:req.body.address, 
		tel:req.body.tel,
		geometry: { 
			type: 'Point', 
			coordinates: [req.body.longitude, req.body.latitude]
		}
	});

	// save()로 저장
	coffeeshop.save((err, result) => {
		if (err) {
			console.error('커피숍 추가 중 에러 발생 : ' + err.stack);
			res.status(400).json({error: '커피숍 추가 중 에러 발생'});
		}

		if (result) {
			console.log('커피숍 등록 성공');
			console.dir(result);
			res.status(200).json({success:true});
		} else {
			console.log('커피숍 등록 실패');
			res.status(400).json({success:false});
		}
	});	

});

router.get('/list', (req, res) => {
	console.log('GET /api/coffeeshop/list called');
 
	var database = req.app.get('database');
	if (database.db) {
		// 모든 커피숍 검색
		database.CoffeeShopModel.findAll((err, results) => {
			if (err) {
                console.error('커피숍 리스트 조회 중 에러 발생 : ' + err.stack);
                return res.status(400).json({message:'커피숍 리스트 조회 중 에러 발생'});
            }
			  
			if (results) {
				console.dir(results);
 				return res.status(200).json(results);
				/*
				for (var i = 0; i < results.length; i++) {
					var curName = results[i]._doc.name;
					var curAddress = results[i]._doc.address;
					var curTel = results[i]._doc.tel;
					var curLongitude = results[i]._doc.geometry.coordinates[0];
					var curLatitude = results[i]._doc.geometry.coordinates[1];
				}	
				*/
			} else {
				res.status(404).json({message:'커피숍 리스트를 찾을 수 없습니다.'})
			}
		});
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'})
	}
});

// 가까운 커피숍 10개 조회
router.get('/findnear', (req, res) => {
	console.log('coffeeshop 모듈 안에 있는 findNear 호출됨.');
  
	var maxDistance = 3000;
    var paramLongitude = req.query.longitude;
    var paramLatitude = req.query.latitude;
	
    console.log('요청 파라미터 : ' + paramLongitude + ', ' + paramLatitude);
    
	var database = req.app.get('database');
	if (database.db) {
		// 가까운 커피숍 10개 검색
		database.CoffeeShopModel.findNear(paramLongitude, paramLatitude, maxDistance, 10, (err, results) => {
			if (err) {
                console.error('커피숍 검색 중 에러 발생 : ' + err.stack);
                return res.status(400).json({message:'커피숍 검색 중 에러 발생'});
            }
			  
			if (results) {
				console.dir(results);
				console.status(200).json(results);
			} else {
				console.log('가까운 커피숍 없음');
				res.status(404).json({message:'가까운 커피숍 없음'});
			}
		});
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
	
});




router.get('./findcircle', (req, res) => {
	console.log('coffeeshop 모듈 안에 있는 findCircle 호출됨.');
  
    var paramCenterLongitude = req.body.center_longitude || req.query.center_longitude;
    var paramCenterLatitude = req.body.center_latitude || req.query.center_latitude;
    var paramRadius = req.body.radius || req.query.radius;
	
    console.log('요청 파라미터 : ' + paramCenterLongitude + ', ' + paramCenterLatitude + ', ' + 
               paramRadius);
    
	var database = req.app.get('database');
	
	if (database.db) {
		database.CoffeeShopModel.findCircle(paramCenterLongitude, paramCenterLatitude, paramRadius, function(err, results) {
			if (err) {
                console.error('커피숍 검색 중 에러 발생 : ' + err.stack);
                return res.status(400).json({message:'커피숍 검색 중 에러 발생'});
            }
			  
			if (results) {
				console.dir(results);
				res.status(200).json(results);
			} else {
				res.status(404).json({message:'반경 내 커피숍 검색 실패'})
			}
		});
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
	
});



module.exports = router;