'use strict';

var router = require('express').Router()
const fs = require('fs')
const path = require('path')
const multer  = require('multer')
const User = require('../models/model_user')
const Cafe = require('../models/model_cafe')
const Item = require('../models/model_item')
const Image = require('../models/model_image')
const util = require('../util')

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', `${Date.now()}`)
      fs.mkdirSync(uploadsDir)
      cb(null, uploadsDir)
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname)
    }
  }),
});



// 카페 대표 이미지 등록/수정
router.post('/:cafeId/profileimg', upload.single('data'), (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err))
    if (!cafe) return res.status(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'))
    
    if (cafe.profileImg) {
      Image.deleteOne({ path: cafe.profileImg }, function(err, image) {
        if (err) return res.send(err)
      })
    }
    
    const path = require('path')
    const remove = path.join(__dirname, '..', 'public')
    const relPath = req.file.path.replace(remove, '')
    const newImage = new Image(req.body)
    newImage.path = relPath
    
    
    newImage.save((err, image) => {
      if (err) return res.status(500).json(util.successFalse(err))
      cafe.profileImg = image.path
      cafe.save()
				.then(image => res.status(500).json(util.successTrue(cafe.profileImg)))
				.catch(err => res.status(500).json(util.successFalse(err)));
    })
  })
})


// 카페 대표 이미지 삭제
router.delete('/:cafeId/profileimg', (req, res) => {
  Cafe.findOne({cafeId:req.params.cafeId}, (err, cafe) => {
    if (err) return res.status(500).json(util.successFalse(err));
    if (!cafe) return res.status(404).json(util.successFalse(null, '존재하지 않는 카페입니다.'));
    
    Image.deleteOne({ _id: req.params.id }, function(err, image) {
      if (err) return res.send(err);
      res.json(util.status(200).json(util.successTrue()));
    })
  })          
});






// 카페 이미지들 가져오기



// 카페 이미지 업로드



// 카페 이미지 삭제







// 카페 메뉴 이미지들 가져오기



// 카페 메뉴 이미지 업로드/수정



// 카페 메뉴 이미지 삭제



module.exports = router;
