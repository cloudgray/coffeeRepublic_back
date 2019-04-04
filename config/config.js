/*
 * 설정
 */

module.exports = {
	server_port: 3000,
	db_uri: 'mongodb://localhost:27017/local',
	db_schemas: [
	  {file:'./user_schema', collection:'users6', schemaName:'UserSchema', modelName:'UserModel'}
    , {file:'./device_schema', collection:'devices', schemaName:'DeviceSchema', modelName:'DeviceModel'}
	, {file:'./coffeeshop_schema', collection:'coffeeshops', schemaName:'CoffeeShopSchema', modelName:'CoffeeshopModel'}
	, {file:'./item_schema', collection:'items', schemaName:'ItemSchema', modelName:'ItemModel'}
	],
	'secret': 'SeCrEtKeYfOrHaShInG',
	facebook: {		// passport facebook
		clientID: '1442860336022433',
		clientSecret: '13a40d84eb35f9f071b8f09de10ee734',
		callbackURL: 'http://localhost:80/auth/facebook/callback'
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

	fcm_api_key:'AIzaSyA_W-ajhqNb76iZHLbaVW30Ytt2_2E5Lpc'
}
