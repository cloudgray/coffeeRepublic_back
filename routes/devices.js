
const router = require('express').Router();
var fcm = require('node-gcm');
var config = require('../config/config.js');

//
// 아직 수정 안 함.
//

router.post('/register', (req, res) => {
	console.log('POST /api/device/register called');
	
	var database = req.app.get('database');
    
	// 데이터베이스 객체가 초기화된 경우
	if (database.db) {
		
		// DeviceModel 인스턴스 생성
		var device = new database.DeviceModel({
			"mobile":req.body.mobile, 
			"osVersion":req.body.osVersion, 
			"model":req.body.model, 
			"display":req.body.display, 
			"manufacturer":req.body.manufacturer, 
			"macAddress":req.body.macAddress,
			"registrationId":req.body.registrationId
		});

		// save()로 저장
		device.save((err) => {
			if (err) {
                console.error('단말 정보 추가 중 에러 발생 : ' + err.stack);
                return res.status(400).json({message:'단말 정보 추가 중 에러 발생'});
            }
		    console.log("단말 데이터 추가함.");
		    console.dir(device);
		    res.status(200).json({success:true});
		});
		
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
	
});



router.get('/list', (req, res) => {
	console.log('device 모듈 안에 있는 listdevice 호출됨.');

	var database = req.app.get('database');
	
	// 데이터베이스 객체가 초기화된 경우
	if (database.db) {
        
		// 1. 모든 단말 검색
		database.DeviceModel.findAll(function(err, results) {
			if (err) {
				console.error('단말 리스트 조회 중 에러 발생 : ' + err.stack);
                res.status(400).json({message:'단말 리스트 조회 중 에러 발생'});
			}
			  
			if (results) {
				console.dir(results);
				res.status(200).json(results);
			} else {
				res.status(404).json({message:'단말 리스트를 찾을 수 없습니다.'});
			}
		});
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
	
});


var sendall = function(req, res) {
	console.log('device 모듈 안에 있는 register 호출됨.');
	
	var database = req.app.get('database');
	 
    var paramData = req.body.data || req.query.data;
	
    console.log('요청 파라미터 : ' + paramData);
    
	// 데이터베이스 객체가 초기화된 경우
	if (database.db) {
        
		// 1. 모든 단말 검색
		database.DeviceModel.findAll(function(err, results) {
			if (err) {
                console.error('푸시 전송을 위한 조회 중 에러 발생 : ' + err.stack);
                return res.status(400).json({message:'푸시 전송을 위한 조회 중 에러 발생'});
            }
			  
			if (results) {
				console.dir(results);

				// 등록 ID만 추출
				var regIds = [];
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.registrationId;
					console.log('등록 ID #' + i + ' : ' + regIds.length);
					
					regIds.push(curId);
				}
				console.log('전송 대상 단말 수 : ' + regIds.length);
				
                if (regIds.length < 1) {
                    console.info('푸시 전송 대상 없음 : ' + regIds.length);
                	return res.status(404).json({message:'대상 단말을 선택하고 다시 시도해보세요.'});
                }
				
				// node-gcm을 이용해 전송
				var message = new fcm.Message({
				    priority: 'high',
				    timeToLive: 3
				});
				message.addData('command', 'show');
				message.addData('type', 'text/plain');
				message.addData('data', paramData);

				var sender = new fcm.Sender(config.fcm_api_key);

				sender.send(message, regIds, function (err, result) {
					if (err) {
                        console.error('푸시 전송 시도 중 에러 발생 : ' + err.stack);
                		res.status(400).json({message:'푸시 전송 도중 에러 발생'});
                    }
					// 푸시 메시지 전송 성공
					console.dir(result);
					res.status(200).json({success:true});
				});
				
				
			} else {
				res.status(404).json({message:'단말 조회 실패'});
			}
		});
	} else {
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
	
};

module.exports = router;
