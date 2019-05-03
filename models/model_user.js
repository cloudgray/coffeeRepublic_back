var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

// schema
var userSchema = mongoose.Schema({
    userId: {type:String},
    fcmToken: {type:String, default:''},
    email: {
        type: String,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Should be a vaild email address!'],
        trim: true
    },
    nickname: {type: String, trim: true, unique: true},
    password: {type: String, select:false},
    isStaff: {type:Boolean, default:false},                     // 알바이거나 사장일 경우
    isOwner: {type:Boolean, default:false},                     // 사장일 경우 isStaff와 isOwner가 둘 다 true
    isWorking: {type:Boolean,default:false},                    // 근무중일 경우 - 추가
    myCafeIds: [{type:String}],                                 // 즐겨찾는 카페 목록 - 변경
    myItemIds: [{type:String}],                                 // 메인화면 myCafeMenu의 카페와 메뉴 id - 추가
    myOwnCafeId: {type:String, default:''},                     // 카페 사장/알바인 경우 일하는 카페의 cafeId - 추가
    myCoupons: [{cafeId:String, cafeName:String, num:Number}],  // 내 쿠폰함 - 추가
    myReceiptIds: [{type:String}],                              // 영수증 목록 - 추가
    created_at: {type: Date, index: {unique: false}, default: Date.now},
    updated_at: {type: Date, index: {unique: false}, default: Date.now}
}, {
    toObject: { virtuals: true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
    .get(function () { 
        return this._passwordConfirmation;
    })
    .set(function (value) {
        this._passwordConfirmation = value;
    });

userSchema.virtual('originalPassword')
    .get(function () {
        return this._originalPassword;
    })
    .set(function (value) {
        this._originalPassword = value;
    });

userSchema.virtual('currentPassword')
    .get(function () {
        return this._currentPassword;
    })
    .set(function (value) {
        this._currentPassword = value;
    });

userSchema.virtual('newPassword')
    .get(function () {
        return this._newPassword;
    })
    .set(function (value) {
        this._newPassword = value;
    });

// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;
var passwordRegexErrorMessage = 'Should be minimum 8 characters of alphabet and number combination!';
userSchema.path('password').validate(function (v) {
    var user = this;

    // create user
    if (user.isNew) {
        if (!user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation is required!');
        }
        if (!passwordRegex.test(user.password)) {
            user.invalidate('password', passwordRegexErrorMessage);
        } else if (user.password !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }

    // update user
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate('currentPassword', 'Current Password is required!');
        }
        if (user.currentPassword && !bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
            user.invalidate('currentPassword', 'Current Password is invalid!');
        }
        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            user.invalidate('newPassword', passwordRegexErrorMessage);
        } else if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate('passwordConfirmation', 'Password Confirmation does not matched!');
        }
    }
});

// hash password
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    } else {
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

// model methods
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

// model & export
var User = mongoose.model('user', userSchema);
module.exports = User;