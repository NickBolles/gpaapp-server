var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    moment      = require('moment'),
    log         = require('../modules/log'),
    GpaappData  = require('./gpaapp/data'),
    Term        = require('./gpaapp/term'),
    mode   = process.env.NODE_ENV || 'development',
    config  = require('../config/config.js')[mode];
    defaultTerm = config.defaultTerm,
    math        = require('../modules/libs/Math.uuid'),
    bcrypt      = require('../modules/libs/bcrypt'),
    SALT_WORK_FACTOR = 8,
    MAX_LOGIN_ATTEMPTS = 7,
    LOCK_TIME = 60 * 60 * 1000,
    regex       =new RegExp("[A-Z0-9a-z.!#$%&'*+-/=?^_`{|}~]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}");
var match = [
    regex,
    "({VALUE}) is not a valid Email Address"
];

var schemaObj ={
    email: {type:String, lowercase: true, match: match, required: true, unique: true},
    firstName: {type:String, lowercase: true},
    lastName:{type:String, lowercase: true},
    pass: {type:String, unique: true, required: true},
    passSalt: {type:String, required: true},
    uuid:{type:String, unique: true, index: {unique: true}, required: true, default: math.uuid()},
    created:{type:Number, default: moment.utc().unix()},
    modified:{type:Number, default: moment.utc().unix()},
    logins:[{
        time:{type:Number, default: moment.utc().unix(), required:true},
        success: {type:Boolean, required: true},
        activity: {type:String, trim:true}
    }],
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Number },
    tags: [String],
    data: {
        gpaapp: [
            GpaappData.schema
        ]
    }
};
//dynamically create the data array for all applications in the config file
//for (var i = 0;i<apps.length;i++){
//    //the data[app[i]] should be a schema of the applications data
//    //which should be named DataSchema
//    //in the folder of its application name
//    schemaObj.data[apps[i]] = require('./'+apps[i] + '/data').schema;
//}

var UserSchema = new Schema(
    schemaObj,
    {
        strict:'throw',
        collection:'users'
    }
);
UserSchema.statics.new = function (model, cb) {
    var newUser = new this(model);
    if (!newUser.data.gpaapp || !newUser.data.gpaapp[0]){
        newUser.data.gpaapp = [];
        defaultTerm.termSDate = moment.utc().startOf('day').unix();
        defaultTerm.termEDate = moment.utc().startOf('day').add(4,'months').unix();
        defaultTerm.modified = moment.utc().unix();
        defaultTerm.termId   = math.uuid();
        newUser.data.gpaapp[0] = new GpaappData({terms:[defaultTerm]});
    }
    if (newUser.pass && !newUser.passSalt){
        newUser.hashPassword(function(){
            cb(newUser);
        })
    }else{
        cb(newUser);
    }
};
//Set up the virtual properties of the user
UserSchema.virtual('terms').get(function(){
    console.log("Virtual User.terms");
    return this.data.gpaapp[0].terms;
});
UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > moment.utc().unix());
});
UserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {

        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: moment.utc().unix() + LOCK_TIME };
    }
    return this.update(updates, cb);
};
//Set up the hooks for save,init,validate, and remove
UserSchema.pre('save',function(next){
    console.log("User.Pre('Save')");
    var user = this;
    //if the user doesnt have a uuid then create one
    if (!user.uuid){
        user.uuid = math.uuid();
    }
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    user.hashPassword(function(err){
        if (err){
            return next(err);
        }
        else{
            next();
        }
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    var user = this;
    var time = true;
    if (time){
        var timer = new log.timer;
        timer.start();
    }
    bcrypt.compare(candidatePassword, this.pass, function (err, isMatch) {
        time ? timer.stop(): {};
        time ? console.log("Compared password for " + user.email + " Took " + timer.getElapsed()): {};
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
UserSchema.methods.hashPassword = function(cb){
    var user = this;
    // generate a salt
    var time = true;
    if (time){
        var timer = new log.timer;
        timer.start();
    }
    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        time? console.log("Generated salt for " + user.email + " Took " + timer.getElapsed()): {};
        if (err) return err;
        user.passSalt = salt;
        // hash the password along with our new salt
        bcrypt.hash(user.pass, salt, null, function (err, hash) {
            time? timer.stop():{};
            time? console.log("Hashed password for " + user.email + " Took " + timer.getElapsed()): {};
            log.totalTime += timer.getElapsed();
            if (err) return err;
            delete user.pass;
            // override the clear text password with the hashed one
            user.pass = hash;
            cb();
        });
    })
};
UserSchema.methods.addTerm = function(term,callback){
    var me = this;
    //TODO debug code
    console.log("User.addTerm");
    console.log(me.data.gpaapp[0].terms.length);
    var newTerm = new Term(term);
    newTerm.validate(function(err){
        if (err){
            //TODO debug code
            console.log("Term is invalid");
            callback(err)
        }else{
            //TODO debug code
            console.log("Term is valid");
            console.log(me.data.gpaapp[0].terms.length);
            me.data.gpaapp[0].terms.push(newTerm);
            callback(null,newTerm);
        }
    });

};
UserSchema.statics.getAuthenticated = function(email, password, cb) {
    this.findOne({ email: email }, function(err, user) {
        if (err) return cb(err);

        // make sure the user exists
        if (!user) {
            return cb(null, null, "Incorrect Username");
        }

        // check if the account is currently locked
        if (user.isLocked) {
            user.logins.push({success: false, activity: "Attempting to login to locked account. Attempt number " + (this.loginAttempts+1)});
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, null, "Account is locked. Please Try again later, or reset your password");
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return cb(err);

            // check if the password was a match
            if (isMatch) {
                user.logins.push({success: true, activity: "Logging in..."});
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
                //Otherwise we need to reset attempts and lock info then return the user
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return cb(err);
                    return cb(null, user);
                });
            }
            user.logins.push({success: false, activity: "Attempting to login with invalid password. Attempt number " + this.loginAttempts});
            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return cb(err);
                return cb(null, false, "Incorrect Password");
            });
        });
    });
};
module.exports = mongoose.model('User', UserSchema);


//module.exports = function(sequelize, DataTypes) {
//    var User = sequelize.define("User", {
//        email: {type:DataTypes.STRING,unique:true, allowNull:false},
//        name: DataTypes.STRING,
//        password: DataTypes.STRING,
//        salt: DataTypes.STRING,
//        uuid: {type: DataTypes.STRING(36), unique:true, primaryKey:true, allowNull:false}
//    }
//        /*, {
//        classMethods: {
//            associate: function(models) {
//                User.hasMany(models.Task)
//            }
//        }
//    }*/
//    );
//
//
//
//    return User;
//};