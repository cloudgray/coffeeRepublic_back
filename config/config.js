/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_url: 'mongodb://localhost:27017/local',
	db_schemas: [
	    {file:'./user_schema', collection:'users6', schemaName:'UserSchema', modelName:'UserModel'}
        , {file:'./device_schema', collection:'devices', schemaName:'DeviceSchema', modelName:'DeviceModel'}
		, {file:'./coffeeshop_schema', collection:'coffeeshops', schemaName:'CoffeeShopSchema', modelName:'CoffeeshopModel'}
		, {file:'./item_schema', collection:'items', schemaName:'ItemSchema', modelName:'ItemModel'}
	],
	route_info: [
		//===== User =====//
        {file:'./user', path:'/process/listuser', method:'listuser', type:'post'}
        , {file:'./user', path:'/process/adduser', method:'adduser', type:'post'}
		
		//===== Device =====//
	    , {file:'./device', path:'/process/adddevice', method:'adddevice', type:'post'}
	    , {file:'./device', path:'/process/listdevice', method:'listdevice', type:'post'}
	    , {file:'./device', path:'/process/register', method:'register', type:'post'}
	    , {file:'./device', path:'/process/sendall', method:'sendall', type:'post'}
		
		//===== CoffeeShop =====//
	    , {file:'./coffeeshop', path:'/process/addcoffeeshop', method:'add', type:'post'}	 
	    , {file:'./coffeeshop', path:'/process/listcoffeeshop', method:'list', type:'post'}
	    , {file:'./coffeeshop', path:'/process/nearcoffeeshop', method:'findNear', type:'post'}
	    , {file:'./coffeeshop', path:'/process/withincoffeeshop', method:'findWithin', type:'post'}
	    , {file:'./coffeeshop', path:'/process/circlecoffeeshop', method:'findCircle', type:'post'}
	    , {file:'./coffeeshop', path:'/process/nearcoffeeshop2', method:'findNear2', type:'post'}
	    , {file:'./coffeeshop', path:'/process/withincoffeeshop2', method:'findWithin2', type:'post'}
		
		//===== Item =====//
		, {file:'./item', path:'/process/additem', method:'additem', type:'post'}
	],
	facebook: {		// passport facebook
		clientID: '1442860336022433',
		clientSecret: '13a40d84eb35f9f071b8f09de10ee734',
		callbackURL: 'http://localhost:3000/auth/facebook/callback'
	},
	twitter: {		// passport twitter
		clientID: 'id',
		clientSecret: 'secret',
		callbackURL: '/auth/twitter/callback'
	},
	google: {		// passport google
		clientID: 'id',
		clientSecret: 'secret',
		callbackURL: '/auth/google/callback'
	},
	fcm_api_key:'AAAA_b17X-4:APA91bEOAH0oYbwFx2x4aeNJpz-X-i6BBsEaKz4Khyet7Q9xTGW6SIgJec66_TBPqi4ZxUbCtJ87ZcFNbLweg0IzubLbsfKRtcvmaFxV-6kqcZVFJVhzvDHExfeK4rltvfhWA83MoxOPVhTUFnEOUnt9xiC6nt_Ypg'
}