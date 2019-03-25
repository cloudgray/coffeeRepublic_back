

const randomstring = require("randomstring");


var additem = function(req, res) {
	console.log('device 모듈 안에 있는 adddevice 호출됨.');
	
	var database = req.app.get('database');
	
	var name = req.body.name;
	var coffeeshopId = req.body.coffeeshopId;
	var itemId = randomstring.generate(10);
	var price = req.body.price;
	var created_at = req.body.created_at;
    var updated_at = req.body.updated_at;
	
	if (database.db) {
		var item = new database.ItemModel({
			"name":name 
			, "coffeeshopId":coffeeshopId
			, "itemId":itemId
			, "price":price
			, "created_at":updated_at
			, "updated_at":created_at
		});
		
		// save()로 저장
		item.save(function(err) {
			if (err) {
                console.error('새로운 상품 정보 추가 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
                res.write("{code:'500', 'message;':'새로운 상품 정보 추가 중 에러 발생'}");
				res.end();
                return;
            }
			
		    console.log("상품 데이터 추가함.");
		    
		    console.dir(item);
		    
			res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
			res.write("{code:'200', 'message':'상품 데이터 추가 성공'}");
			res.end();
		     
		});
		
	} else {
		res.writeHead('200', {'Content-Type':'application/json;charset=utf8'});
		res.write("{code:'400', 'message':'데이터베이스 연결 실패'}");
		res.end();
	}
	
	
};



module.exports.additem = additem;
