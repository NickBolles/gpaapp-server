var moment		= require('moment');
var utils 		= require('../../modules/utils.js');
var passport 	= require('passport');
var log			= require('../../modules/log.js');
var mongoose	= require('mongoose');
var GpaController = require('./controller');
var testing = true;
var timer = 0;
module.exports = function(app) {


	app.get('/gpaapp/userdata',function(req,res){
		//if (global.testing){log.responseBegin('get: /gpabot/userdata');}
		passport.authenticate('login', function(err, user, info) {
			if (err) { return res.status(500).json( {message:'Internal server error. router:86', details: info}); }
			if (!user) {
				return res.status(401).json( {message:'User Not Found', details: info} );
			}
			req.logIn(user, function(err) {
				if (err) { return res.status(500).json( {message:'Internal server error. router:82', details: err}); }
				return res.status(200).json( {message:'ok', data: user.data.gpaapp[0]} );
			});
		})(req, res);
	});
	app.post('/gpaapp/userdata', function(req, res){
		//if (global.testing){log.responseBegin('POST: /gpabot/userdata');}
		passport.authenticate('login', function(err, user, info) {
			if (err) { return res.status(500).json( {message:'Internal server error. router:86', details: info}); }
			if (!user) {
				return res.status(401).json( {message:'User Not Found', details: info} );
			}
			req.logIn(user, function(err) {
				if (err) { return res.status(500).json( {message:'Internal server error. router:82', details: err}); }
				return res.status(200).json( {message:'ok', data: user.data.gpaapp[0]} );
			});
		})(req, res);
		//console.log('req.body is ' + req.body);
		////console.log('req.body is ' + JSON.stringify(req.body));
		//if (req.body.force == 'true') {
		//
		//    DM.saveUserData(req.cookies.email, req.body.data, function(e){
		//        if (e){
		//            console.log(e);
		//            res.status(400).json({'message': e});
		//		if (global.testing){log.responseComplete('Post: /gpabot/userdata  ERROR');}
		//
		//        }else{
		//            var response = {message: 'ok'};
		//            res.status(200).json( response );
		//		if (global.testing){log.responseComplete('Post: /gpabot/userdata  Success');}
		//        }
		//    });
		//}else{
		//
		//    DM.syncUserData(req.cookies.email, req.body , function(e, userData){
		//        if (e){
		//            console.log(e);
		//            res.status(400).json({'message': e});
		//		if (global.testing){log.responseComplete('Post: /gpabot/userdata  ERROR');}
		//
		//        }else{
		//            console.log('DATA SYNCED userData is ' + userData);
		//            userData = utils.toStr(userData);
		//            var response = {message: 'ok', data: userData};
		//            res.status(200).json( response );
		//		if (global.testing){log.responseComplete('Post: /gpabot/userdata  Success');}
		//        }
		//    });
		//}

	});
	app.delete('/gpabot/userdata', GpaController.deleteUserData);


};