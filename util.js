
const jwt = require('jsonwebtoken');
const config = require('./config/config'); 
var User = require('./models/model_user');

var util = {};

util.successTrue = function(data){
  return {
    success:true,
    message:null,
    errors:null,
    data:data
  };
};

util.successFalse = function(err, message){
  if(!err&&!message) message = 'data not found';
  return {
    success:false,
    message:message,
    errors:(err)? util.parseError(err): null,
    data:null
  };
};

util.parseError = function(errors){
  var parsed = {};
  if(errors.name == 'ValidationError'){
    for(var name in errors.errors){
      var validationError = errors.errors[name];
      parsed[name] = { message:validationError.message };
    }
  } else {
    parsed.unhandled = errors;
  }
  return parsed;
};


// middlewares
util.isLoggedin = function(req,res,next){
  var token = req.headers['x-access-token'];
  if (!token) return res.json(util.successFalse(null,'token is required!'));
  else {
    jwt.verify(token, config.secret, function(err, decoded) {
      if(err) return res.json(util.successFalse(err));
      else{
        req.decoded = decoded;
        next();
      }
    });
  }
};

// private functions
util.isStaff = function(req, res, next) {
	User.findOne({
		userId: req.decoded.userId
	}, (err, user) => {
		if (err || !user) return res.status(500).json(util.successFalse(err));
		else if (!req.decoded || !user.isStaff)
			return res.json(util.successFalse(null, 'You don\'t have permission'));
		else next();
	});
}

// private functions
util.isOwner = function(req, res, next) {
	User.findOne({
		userId: req.decoded.userId
	}, (err, user) => {
		if (err || !user) return res.status(500).json(util.successFalse(err));
		else if (!req.decoded || !user.isOwner)
			return res.json(util.successFalse(null, 'You don\'t have permission'));
		else next();
	});
}

// order queues
util.queues = {};

module.exports = util;