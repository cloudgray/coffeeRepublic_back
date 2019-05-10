
var router = require('express').Router();
const fs = require('fs');
const path = require('path');
const multer  = require('multer');
const randomstring = require('randomstring');
const Cafe = require('../models/model_cafe');
const Item = require('../models/model_item');
const User = require('../models/model_user');
const Image = require('../models/model_image');
const util = require('../util');


// 카페 등록 - 스테프로 로그인해야 한다
router.post('/', util.isLoggedin, util.isStaff, (req, res) => {
	console.log('POST api/cafes called');
  
  User.findOne({userId:req.decoded.userId}, (err, user) => {
    // 일단 사장님 한 명이 카페 하나만 소유하도록 한다.
    // 매장을 두 개 이상 운영하는 경우는 추후에 수정...
    if (user.cafeId) return res.status(400).json(util.successFalse(null, '이미 등록된 카페가 있습니다.'));
    
    // 같은 매장의 중복 등록을 방지한다.
    Cafe.findOne({name:req.body.name, address:req.body.address, tel:req.body.tel}, (err, cafe) => {
      
      if (err) return res.status(500).json(util.successFalse(err));
      if (cafe) return res.status(400).json(util.successFalse(null, '이미 등록된 카페입니다.'));


      var newCafe = new Cafe(req.body);
      newCafe.geometry.coordinates = [req.body.longitude, req.body.latitude];
      newCafe.cafeId = randomstring.generate(16);
			
			const uploadDir = path.join(__dirname, '..', 'public', 'uploads', `${newCafe.cafeId}`);
			fs.mkdir(uploadDir);
			
      user.myOwnCafeId = newCafe.cafeId;
      newCafe.ownerId = user.userId;

      user.save()
          .catch(err => res.status(500).json(util.successFalse(err)));
      
      // save()로 저장
      newCafe.save((err, cafe) => {
        if (err) return res.status(500).json(util.successFalse(err));
        if (!cafe) return res.status(404).json(util.successFalse(null, '커피숍 등록 실패')); 
        res.status(200).json(util.successTrue(cafe));
      });
    });
  });  
});



// 카페 리스트 가져오기
router.get('/', (req, res) => {
	console.log('GET /api/cafe called');
 
  Cafe.find({"deprecated":false}, (err, cafes) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafes) return res.status(404).json(util.successFalse(null, '등록된 카페가 없습니다.'));
    res.status(200).json(util.successTrue(cafes));
  });  
});

// 가까운 커피숍 10개 조회
router.get('/near', (req, res) => {
	console.log('cafe 모듈 안에 있는 findNear 호출됨.');
  
	var maxDistance = 3000;
  var longitude = req.body.longitude;
  var latitude = req.body.latitude;
	
  console.log('요청 파라미터 : ' + longitude + ', ' + latitude);
		// 가까운 커피숍 10개 검색
  Cafe.findNear(longitude, latitude, maxDistance, 10, (err, cafes) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafes) return res.status(404).json(util.successFalse(null, '주변에 예약 주문이 가능한 카페가 없습니다.ㅠㅠ'));
    res.status(200).json(util.successTrue(cafes));
  });
});

// 카페 상세정보 가져오기
router.get('/:cafeId', (req, res) => {
  console.log('GET /:cafeId called');
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    res.status(200).json(util.successTrue(cafe));
  });
});


// 카페 정보 수정
router.put('/:cafeId', util.isLoggedin, util.isStaff, (req, res) => {
  console.log('PUT /:cafeId called');
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    for (var p in req.body) {
			cafe[p] = req.body[p];
		}
    cafe.geometry.coordinates = [req.body.longitude,req.body.latitude];
    cafe.updated_at = Date.now();
    
    cafe.save((err, cafe) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 정보 수정 실패'));
      res.status(200).json(util.successTrue(cafe));
    }); 
  });
});


// 카페 탈퇴
router.delete('/:cafeId/unregister', util.isLoggedin, util.isOwner, (req, res) => {
  console.log('DELETE /:cafeId/unregister called');
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(400).json(util.successFalse(err, '잘못된 요청입니다.')); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    cafe.deprecated = true;
    cafe.updated_at = Date.now;
    cafe.save((err, cafe) => {
      if (err) return res.status(400).json(util.successFalse(err, '카페 탈퇴 실패'));
      res.status(200).json(util.successTrue(cafe));
    }); 
  });
});




// 메뉴 목록 가져오기
router.get('/:cafeId/items', (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    Item.find({itemId:{$in: cafe.itemIds}}, (err, items) => {
      if (err||!items) return res.status(500).json(util.successFalse(err)); 
      
      res.status(200).json(util.successTrue(items));
    });
  });
});

// 메뉴 등록
router.post('/:cafeId/items', util.isLoggedin, util.isStaff, (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    Item.findOne({name:req.body.name, price:req.body.price}, (err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (item) return res.status(404).json(util.successFalse(null, '이미 등록된 메뉴입니다.'));

      var newItem = new Item(req.body);
      newItem.itemId = randomstring.generate(16);
      
      cafe.itemIds.push(newItem.itemId);
      cafe.save()
        .catch(err => console.log(err));
      
      newItem.save()
        .then(item => res.status(200).json(util.successTrue(item)))
        .catch(err => res.status(500).json(util.successFalse(err)));
    });
  }); 
});


// 대표 메뉴 등록
router.put('/:cafeId/signature/:itemId', util.isLoggedin, util.isStaff, (req, res) => {
	Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
		if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
		
		Item.findOne({itemId:req.params.itemId}, (err, item) => {
			if (err) return res.status(500).json(util.successFalse(err)); 
    	if (!item) return res.status(404).json(util.successFalse(null, '등록되지 않은 메뉴입니다.'));
			
			cafe.signatureItems.push(item.name);
			cafe.save()
				.then(cafe => res.status(200).json(util.successTrue(cafe.signatureItems)))
				.catch(err => res.status(500).json(util.successFalse(err)));				
		});
	});
});


// 메뉴 수정
router.put('/:cafeId/items/:itemId', util.isLoggedin, util.isStaff, (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    Item.findOne({itemId:req.params.itemId}, (err, item) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (!item) return res.status(404).json(util.successFalse(null, '등록된 메뉴가 아닙니다.'));

      for (var p in req.body) {
        item[p] = req.body[p];
      }
      
      item.save()
        .then(item => res.status(200).json(util.successTrue(item)))
        .catch(err => res.status(500).json(util.successFalse(err)));
    });
  });
});

//메뉴 삭제
router.delete('/:cafeId/items/:itemId', util.isLoggedin, util.isStaff, (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    Item.findOneAndDelete({itemId:req.params.itemId}, (err, item) => {
      if (err) return res.status(400).json(util.successFalse(err));
      if (!item) return res.status(404).json(util.successFalse(null, '존재하지 않는 메뉴입니다.'));
      
      cafe.itemIds.splice(cafe.itemIds.indexOf(req.params.itemId), 1);
      cafe.save()
        .catch(err => console.log(err));
      
      res.status(200).json(util.successTrue(null));
    });   
  });   
});



/*
* 이미지 업로드 관련
*/

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
			Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
				const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', `${cafe.cafeId}`);
				
				// 메뉴 이미지를 업로드 하는 경우
				if (req.params.itemId) {
					Item.findOne({itemId: req.params.itemId}, (err, item) => {
						// 이미지를 수정하거나 같은 이름의 이미지 파일을 올리는지 체크
						console.log(item);
						if (item.image != '') {
							const filePath = path.join(uploadsDir, `${item.image}`);
							// 이미 이미지가 존재하거나 같은 이름이라면 기존 이미지 삭제
							fs.unlink(filePath, (err) => {
								if (err) console.log(err);
								Image.deleteOne({path: item.image}, (err, image) => {
									if (err) console.log(err);
								});
							});
						}
					});
				}
				
				// 카페 프로필 이미지를 수정하는 경우
				// 이미지를 수정하거나 이름이 같은 이미지를 업로드할 때 새 것으로 교체
				else if (cafe.profileImg != '') {
					// 같은 이름이라면 기존 파일 삭제
					const filePath = path.join(uploadsDir, cafe.profileImg);
					fs.unlink(filePath, (err) => {
						if (err) console.log(err);
						Image.deleteOne({ path: cafe.profileImg }, function(err, image) {
							if (err) console.log(err);
						});
					});
				}
				// public/uploads 폴더에 이미지 저장
				cb(null, uploadsDir);
			});
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    }
  }),
});



// 카페 대표 이미지 등록/수정
router.post('/:cafeId/profileimg', util.isLoggedin, util.isStaff, upload.single('data'), (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafe) return res.status(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'));
    
    const remove = path.join(__dirname, '..', 'public');
    const relPath = req.file.path.replace(remove, '');
    const newImage = new Image(req.body);
    newImage.path = relPath;
    
    newImage.save((err, image) => {
      if (err) return res.status(500).json(util.successFalse(err));
      cafe.profileImg = image.path;
      cafe.save()
				.then(image => res.status(200).json(util.successTrue(cafe.profileImg)))
				.catch(err => res.status(500).json(util.successFalse(err)));
    });
  });
});


// 카페 대표 이미지 삭제
router.delete('/:cafeId/profileimg', util.isLoggedin, util.isStaff, (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafe) return res.status(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'));
		
    Image.deleteOne({ path: cafe.profileImg }, (err, image) => {
			if (err) return res.status(500).json(util.successFalse(err));
			const filepath = path.join(__dirname, '..', 'public', cafe.profileImg);
			fs.unlink(filepath, (err) => {
				if (err) return res.status(500).json(util.successFalse(err));
				cafe.profileImg = '';
				cafe.save()
					.then(cafe => res.status(200).json(util.successTrue()))
					.catch(err => res.status(500).json(util.successFalse(err)));
			});
    });
  });       
});

// 메뉴 이미지 등록/수정
router.post('/:cafeId/:itemId/img', util.isLoggedin, util.isStaff, upload.single('data'), (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafe) return res.status(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'));
    
		Item.findOne({itemId:req.params.itemId}, (err, item) => {
			const remove = path.join(__dirname, '..', 'public');
			const relPath = req.file.path.replace(remove, '');
			const newImage = new Image(req.body);
			newImage.path = relPath;

			newImage.save((err, image) => {
				if (err) return res.status(500).json(util.successFalse(err));
				item.image = image.path;
				item.save()
					.then(item => res.status(200).json(util.successTrue(item.image)))
					.catch(err => res.status(500).json(util.successFalse(err)));
			});
		});
  });
});




/*
* test functions
*/

// 카페 여러개 한꺼번에 등록
router.post('/atonce', (req, res) => {
	console.log('POST api/cafes/atonce called');
	
	const cafelist = req.body.cafelist;
	var cafeIds = [];
	for (var i in cafelist) {
		cafeIds.push(randomstring.generate(16));
	}
  
	Cafe.find({cafeId: {$in: cafeIds}}, (err, cafes) => {
		if (err) return res.status(500).json(util.successFalse(err));
    if (cafes.length != 0) return res.status(400).json(util.successFalse(null, '이미 등록된 카페가 있습니다.'));
	
		User.find({isOwner:true}, (err, users) => {
			if (err) return res.status(500).json(util.successFalse(err));
			if (users.length < cafeIds.length) return res.status(400).json(util.successFalse(null, 'too many cafes'));
			
			for (var i in cafeIds) {
				users[i].myOwnCafeId = cafeIds[i];
				users[i].save()
					.catch(err => res.status(500).json(util.successFalse(err)));
			}
			
			for (var i in cafelist) {
				var newCafe = new Cafe();
				for (var p in cafelist[i]) {
					console.log(cafelist[i][p]);
					newCafe[p] = cafelist[i][p];
				}
				newCafe.geometry.coordinates = [cafelist[i].longitude, cafelist[i].latitude];
				newCafe.cafeId = cafeIds[i];		
				newCafe.save()
					.catch(err => res.status(500).json(util.successFalse(err)));
				
				const uploadDir = path.join(__dirname, '..', 'public', 'uploads', `${newCafe.cafeId}`);
				fs.mkdir(uploadDir);
			}
		});	
	});
});


// 메뉴 여러개 한꺼번에 등록
router.post('/:cafeId/itemlist', util.isLoggedin, util.isStaff, (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err)); 
    if (!cafe) return res.status(404).json(util.successFalse(null, '등록되지 않은 카페입니다.'));
    
    var itemlist = req.body.itemlist;
    var namelist = [];
    for (var i in req.body.itemlist) {
      namelist.push(itemlist[i].name);
    }
    Item.find({name:{$in: namelist}}, (err, items) => {
      if (err) return res.status(500).json(util.successFalse(err));
      if (items.length != 0) return res.status(400).json(util.successFalse(null, '중복되는 메뉴가 있습니다.'));
      
      for (var i in itemlist) {
        var newItem = new Item();
        newItem.itemId = randomstring.generate(16);
        newItem.cafeId = req.params.cafeId;
        newItem.name = itemlist[i].name;
        newItem.price = itemlist[i].price;
        newItem.options = itemlist[i].options;
        
        cafe.itemIds.push(newItem.itemId);

        newItem.save()
          .catch(err => res.status(500).json(util.successFalse(err)));
      }

      cafe.save()
        .then(cafe => res.status(200).json(util.successTrue(cafe.itemIds)))
        .catch(err => console.log(err));
    });
  }); 
});



router.get('/test/test', (req, res) => {
	console.log(__dirname);
	const filepath = path.join(__dirname, '..', 'test');
	fs.mkdir(filepath);
});



module.exports = router;