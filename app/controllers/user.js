/**
 * Created by Nicholas on 12/14/2014.
 */
var mongoose    = require('mongoose'),
    User        = mongoose.model('User'),
    bcrypt      = require('./../libs/bcrypt'),
    Log         = require('./../modules/log'),
    passport    = require('passport'),
    moment      = require('moment');
Controller = {};
Controller.register = function(req,res){
    var userDetails = req.body;
    var userData = {appId: userDetails.appId, appName: userDetails.appName};
    delete userDetails.appId;
    delete userDetails.appName;

    User.new(userDetails, function(newUser){
        var query = User.find({}).or([{email:newUser.email}, {uuid:newUser.uuid}]);
        query.exec(function(err,existUser){
            if (err){
                return res.status(500).json({'message':"Error Registering User"});
            }
            if (existUser.length > 0){
                var message = "";
                var details = "";
                if (newUser.email == existUser[0].email){
                    message = "User with that email already exists!";
                    details = "User with email " + newUser.email + " already exists!";
                }
                if (newUser.uuid == existUser[0].uuid){
                    message = "Internal Error, Duplicate Unique ID";
                    details ="User with unique id " +  newUser.uuid + " already exists!";
                }
                console.log(message);
                return res.status(409).json({message:message, details: details});
            }
            newUser.save(function(err) {
                if (err) {
                    console.log(err);
                    return res.status(400).json({'message': err.message});
                } else {
                    passport.authenticate('login', function(err, user, info) {
                        if (err) { return res.status(500).json( {message:'Internal server error. users:43', details: info}); }
                        if (!user) {
                            return res.status(401).json( {message:'User Not Found After Registration', details: info} );
                        }
                        //manually establish the session
                        req.login(user, function(err){
                            if (err){ return res.status(500).json( {message:'Internal server error. users:49', details: err});}
                            return res.status(201).json({'message': 'Account Created', welcome:'Hello ' + user.firstName, user: user.toJSON()} );
                        });
                    })(req, res);
                }
            });
        });

    });

};
Controller.login = function(req,res){
    passport.authenticate('login', function(err, user, info) {
        if (err) { return res.status(500).json( {message:'Internal server error. router:86', details: info}); }
        if (!user) {
            return res.status(401).json( {message:'User Not Found', details: info} );
        }
        //manually establish the session
        req.login(user, function(err){
            if (err){ return res.status(500).json( {message:'Internal server error. users:61', details: err});}
            return res.status(200).json( {message:'Logged In', welcome:'Hello ' + user.firstName, user: user.toJSON()} );

        });
    })(req, res);
};
Controller.changePassword = function(email,pass,callback){
    if (testing){log.sectionStart('login', ['Email: ', email, 'Password: ', pass]);}
    User.getAuthenticated(email,pass, function(err,user){
        if (err) {
            return callback(err);
        }
        if (user){
            console.log("successfully logged in");

        }

    });
};

Controller.logout = function(){

};
Controller.resetPassword = function(email,callback){

        crypto.randomBytes(20, function(err, buf) {
            if (err){return callback(err);}
            var token = buf.toString('hex');
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = moment.utc().unix().add(1,'hour'); // 1 hour

                user.save(function(err) {
                    if (err){return callback(err)}
                    var smtpTransport = nodemailer.createTransport('SMTP', {
                        service: 'gmail',
                        auth: {
                            user: "bollesSoftware",
                            pass: 'l0lkoliop'
                        }
                    });
                    var mailOptions = {
                        to: user.email,
                        from: 'passwordreset@nickbolles.com',
                        subject: 'Password Reset',
                        text: 'You are receiving this because you (or someone else) has requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    smtpTransport.sendMail(mailOptions, function(err) {
                        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                        done(err, 'done');
                    });
                });
            });
        });
};

Controller.resetPasswordFinal= function(req,res){
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: moment.utc().unix() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
        }

        user.pass = req.body.pass;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        user.save(function(err) {
            req.logIn(user, function(err) {
                var smtpTransport = nodemailer.createTransport('SMTP', {
                    service: 'gmail',
                    auth: {
                        user: "bollesSoftware",
                        pass: 'l0lkoliop'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'passwordreset@nickbolles.com',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function(err) {
                    req.flash('success', 'Success! Your password has been changed.');
                    res.redirect('/');
                });
            });

        });
    });
};
Controller.getAppData = function(req,res){

        if (e){
            res.status(400).json({'message': e});
            if (global.testing){log.responseComplete('get: /gpabot/userdata  error');}
        }else{
            var response = {message: 'ok', data: data};
            //may need to be changed to send needed data
            res.status(200).json( response );
            if (global.testing){log.responseComplete('get: /gpabot/userdata  success');}
        }
};
Controller.deleteUser = function(req,res){
        User.findOne({uuid:req.body.id}, function(err, user){
            if (!err){
                user.remove();
                res.clearCookie('user');
                res.clearCookie('pass');
                req.session.destroy(function(e){ res.send('ok', 200); });
            }	else{
                res.send('Account Not Found!', 400);
            }
        });
};

module.exports = Controller;