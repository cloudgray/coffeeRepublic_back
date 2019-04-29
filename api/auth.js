// api/auth.js

var router   = require('express').Router();
const User     = require('../models/model_user');
const util     = require('../util');
const config   = require('../config/config');
const jwt      = require('jsonwebtoken');

// login
router.post('/login', (req,res,next) => {
    var isValid = true;
    var validationError = {
      name:'ValidationError',
      errors:{}
    };

    if(!req.body.email){
      isValid = false;
      validationError.errors.email = {message:'Email is required!'};
    }
    if(!req.body.password){
      isValid = false;
      validationError.errors.password = {message:'Password is required!'};
    }

    if(!isValid) return res.json(util.successFalse(validationError));
    else next();
  },
  (req,res,next) => {
    User.findOne({email:req.body.email})
    .select({userId:1, nickname:1, password:1})
    .exec((err,user) => {
      if(err) return res.json(util.successFalse(err));
      else if(!user||!user.authenticate(req.body.password))
         return res.json(util.successFalse(null,'Email or Password is invalid'));
      else {
        var payload = {
          userId : user.userId,
          nickname: user.nickname
        };
        var options = {expiresIn: 60*60*24};
        jwt.sign(payload, config.secret, options, (err, token) => {
          if(err) return res.json(util.successFalse(err));
          res.json(util.successTrue(token));
        });
      }
    });
  }
);

/*
// staff login
router.post('/stafflogin', (req,res,next) => {
    var isValid = true;
    var validationError = {
      name:'ValidationError',
      errors:{}
    };

    if (!req.body.isStaff) {
      isValid = false;
      validationError.errors.isStaff = {message:'Staff-only access!'}
    }
    if(!req.body.email){
      isValid = false;
      validationError.errors.email = {message:'Email is required!'};
    }
    if(!req.body.password){
      isValid = false;
      validationError.errors.password = {message:'Password is required!'};
    }

    if(!isValid) return res.json(util.successFalse(validationError));
    else next();
  },
  (req,res,next) => {
    User.findOne({email:req.body.email})
    .select({email:1, myOwnCafeId:1, password:1})
    .exec((err,user) => {
      if(err) return res.json(util.successFalse(err));
      else if(!user||!user.authenticate(req.body.password))
         return res.json(util.successFalse(null,'Email or Password is invalid'));
      else {
        var payload = {
          _id : user._id,
          myOwnCafeId : user.myOwnCafeId					
        };
        var options = {expiresIn: 60*60*24};
        jwt.sign(payload, config.secret, options, (err, token) => {
          if(err) return res.json(util.successFalse(err));
          res.json(util.successTrue(token));
        });
      }
    });
  }
);
*/

// refresh
router.get('/refresh', util.isLoggedin, (req,res,next) => {
    User.findOne({userId:req.decoded.userId})
    .exec((err,user) => {
      if(err||!user) return res.json(util.successFalse(err));
      else {
        var payload = {
          userId : user.userId,
          nickname: user.nickname
        };
        var options = {expiresIn: 60*60*24};
        jwt.sign(payload, config.secret, options, (err, token) => {
          if(err) return res.json(util.successFalse(err));
          res.json(util.successTrue(token));
        });
      }
    });
  }
);

module.exports = router;



