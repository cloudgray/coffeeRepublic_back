
const router = require('express').Router();
const randomstring = require("randomstring");


router.post('/add', (req, res) => {
	console.log('POST /api/items/add called');
	
	var database = req.app.get('database');
	
	if (database.db) {
		var item = new database.ItemModel({
			"name":req.body.name, 
			"coffeeshopId":req.body.coffeeshopId,
			"itemId":randomstring.generate(10),
			"price":req.body.price,
			"created_at":req.body.updated_at,
			"updated_at":req.body.created_at
		});
		
		// save()로 저장
		item.save((err) => {
			if (err) {
                console.error('새로운 상품 정보 추가 중 에러 발생 : ' + err.stack);
                
                return res.status(400).json({message:'새로운 상품 정보 추가 중 에러 발생'});
            }
			
		    console.log("상품 데이터 추가함.");
		    console.dir(item);
		    res.status(200).json({success:true});    
		});
		
	} else {
		res.status(500).json({message:'데이터베이스 연결 실패'});
	}
	
});

router.get('/:itemId', (req, res) => {
	var itemId = req.params.itemId;
	console.log('POST /api/items/' + itemId+ ' called');
	
	var database = req.app.get('database');
	if (databse.db) {
		database.ItemModel.findOne({itemId:itemId}, (err, item) => {
			if (err) return res.status(404).json({message:'해당 상품 조회 중 에러 발생'});
			if (item) {
				console.dir(item);
				res.status(200).json(item);
			} else {
				console.log('해당 상품이 존재하지 않습니다.');
				res.status(404).json({message:'해당 상품이 존재하지 않습니다.'});
			}
		});
	} else {
		console.log('데이터베이스 연결 실패');
		res.status(500).json({error:'데이터베이스 연결 실패'});
	}
});



module.exports = router;
