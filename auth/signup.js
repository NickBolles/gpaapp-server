var LocalStrategy   = require('passport-local').Strategy;
var User = require('../models/user');

module.exports = function(passport){

	passport.use('signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'p',
            passReqToCallback: true
        },
        function(req, email, password, done) {

            findOrCreateUser = function(){
                var userDetails = req.body;
                var userData = {appId: userDetails.appId, appName: userDetails.appName};
                delete userDetails.appId;
                delete userDetails.appName;
                // find a user in Mongo with provided username
                User.findOne({ 'email' :  email }, function(err, user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with email: '+email);
                        return done(null, false, {message: "User already exists with email"});
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = User.new({
                            email:email,
                            pass: password,

                        });

                        // set the user's local credentials
                        newUser.email = email;
                        newUser.password = createHash(password);
                        newUser.email = req.param('email');
                        newUser.firstName = req.param('firstName');
                        newUser.lastName = req.param('lastName');

                        // save the user
                        newUser.save(function(err) {
                            if (err){
                                console.log('Error in Saving user: '+err);  
                                throw err;  
                            }
                            console.log('User Registration succesful');    
                            return done(null, newUser);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

}