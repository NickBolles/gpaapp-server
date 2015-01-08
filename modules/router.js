
//var DM = require('./data-manager');
var UC 			= require('./../controllers/user');
var GpaApp 		= require('./../controllers/gpaapp/gpaapp');
var moment		= require('moment');
var utils 		= require('./utils.js');
var passport 	= require('passport');
var log			= require('./log.js');
var mongoose	= require('mongoose');
var gpaapp	= require('../controllers/gpaapp/gpaapp');
var testing = true;
var timer = 0;

module.exports = function(app) {


	// creating new accounts //

	app.get('/signup', function(req, res) {
		//if (global.testing){log.responseBegin('GET: /signup');}
		res.render('signup', {  title: 'Signup'});
	});
	app.post('/signup', UC.register);
	app.get('/login', function(req,res){
		passport.authenticate('local', function(err, user, info) {
			if (err) { return res.status(500).json( {message:'Internal server error. router:86'}); }
			if (!user) {
				return res.status(401).json( {message:'User Not Found'} );
			}

			req.logIn(user, function(err) {
				if (err) { return res.status(500).json( {message:'Internal server error. router:82'}); }
				return res.status(200).json( {message:'Logged In', welcome:'Hello ' + user.firstName} );

			});
		})(req, res);
	});
	
	app.post('/login', UC.login);
	app.get('/reset/:token', function(req, res) {
		User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: moment.utc().unix() } }, function(err, user) {
			if (!user) {
				req.flash('error', 'Password reset token is invalid or has expired.');
				return res.redirect('/forgot');
			}
			res.render('reset', {
				user: req.user
			});
		});
	});
	app.post('/reset/:token', UC.resetPasswordFinal);
// logged-in user homepage //
	
	app.get('/home', function(req, res) {
	    if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
	        res.redirect('/login');
	    }   else{
			res.render('home', {
				title : 'Control Panel',
				udata : req.session.user
			});
	    }
	});
	
	app.post('/home', function(req, res){

	});
	


	app.options('/posts', function(req, res){
		//if (global.testing){log.responseBegin('POST: /posts');}
		console.log("writing headers only");
		res.header("Access-Control-Allow-Origin", "*");
		res.end('');
	  });

// view & delete accounts //
	
	app.get('/print', function(req, res) {
		User.findAll( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', UC.deleteUser);

	app.post('/resetusers', function(req,res){
		if (req.body.areYouSure == 'YES'){
			var names = mongoose.modelNames();
			for (modelName in names){
				var thisModel = mongoose.model(names[modelName]);
				thisModel.remove(function(err, p){
					if(err){
						throw err;
					} else{
						console.log(names[modelName] + ' ' + modelName  + ' cleared');
						console.log('No Of Documents deleted:' + p);
					}
				});
			}
			return res.status(200).json({message:"collections cleared!"});
		}
		return res.status(400).json({message:"ERROR: Please post the field 'areYouSure' with the value 'YES' To wipe the database"})
	});

	gpaapp.router(app);
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};