
var AM = require('./account-manager');
var EM = require('./email-dispatcher');
var DM = require('./data-manager');

module.exports = function(app) {

// main login page //
        app.get('/gpabot/userdata',function(req,res){
            AM.validateToken(req.cookies.token, req.cookies.email, function(o, newToken){
                if (o){
                    res.cookie('token', newToken, { maxAge: 360000 });
                    DM.getUserData({email:req.cookies.email},function(e, data){
                        if (e){
                            res.header("Access-Control-Allow-Origin", req.headers.origin);
                            res.status(400).json({'message': e});
                        }else{
                            var response = {message: 'ok', data: data};
                            res.header("Access-Control-Allow-Origin", req.headers.origin);
                            //may need to be changed to send needed data
                            res.status(200).json( response );
                        }
                    });
                }else{
                    
                }
            });
        });
        app.post('/gpabot/userdata', function(req, res){
		AM.validateToken(req.cookies.token, req.cookies.email, function(o, newToken){
                    if (o){
                        res.cookie('token', newToken, { maxAge: 360000 });
                        DM.saveUserData({email:req.cookies.email, data: req.body},function(e, data){
                            
                        });
                    }else{

                    }
                });
	});
	app.get('/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.token == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.token, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/home');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/login', function(req, res){
		AM.manualLogin(req.param('email'), req.param('p'), function(e, user){
			if (!user){
                                res.header("Access-Control-Allow-Origin", req.headers.origin);
                                //may need to be changed to send needed data
				res.status(400).json({'message': e});
			}	else{
                                
                                req.session.user = user;
				res.cookie('token', user.token, { maxAge: 360000 });
                                res.cookie('email', user.email);
				var response = {message: 'ok'};
                                res.header("Access-Control-Allow-Origin", req.headers.origin);
                                //may need to be changed to send needed data
				res.status(200).json( response );
			}
		});
	});
	
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
		if (req.param('user') != undefined) {
			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});
		}	else if (req.param('logout') == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.send('ok', 200); });
		}
	});
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Signup'});
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			pass	: req.param('p'),
                        uuid    : req.param('uuid')
		}, function(e){
			if (e){
                            console.log(e);
				res.header("Access-Control-Allow-Origin", req.headers.origin);
                                //may need to be changed to send needed data
				res.status(400).json({'message': e});
			}	else{
                            console.log('setting accesscontrolalloworigin');
                                res.header("Access-Control-Allow-Origin", req.headers.origin);
                                //may need to be changed to send needed data
				res.status(201).json({'message': 'AccountCreated'});
				
			}
		});
	});
        app.options('/posts', function(req, res){
            console.log("writing headers only");
            res.header("Access-Control-Allow-Origin", "*");
            res.end('');
          });

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	            req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};