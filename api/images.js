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










// 카페 이미지들 가져오기



// 카페 이미지 업로드



// 카페 이미지 삭제







// 카페 메뉴 이미지들 가져오기



// 카페 메뉴 이미지 업로드/수정



// 카페 메뉴 이미지 삭제



module.exports = router;
