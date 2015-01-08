var LocalStrategy   = require('passport-local').Strategy,
    User = require('../models/user');

module.exports = function(passport){

	passport.use('login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'pass',
            passReqToCallback: true
        },
        function(req, email, password, done) {
            console.log("passport login- email: " + email + " pass " + password + " body " + req.body);
            User.getAuthenticated(email, password, function (err, user) {
                if (err) { return done(err, false,{message:'error getting authentication', details: err}); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                return done(null, user, {message: 'Authentication Successful'});
                //user.comparePassword(password,function(err, isMatch){
                //    if (isMatch){
                //        );
                //    }else{
                //        return done(null, false, { message: 'Incorrect password.' });
                //    }
                //});
            });
        })
    )
};