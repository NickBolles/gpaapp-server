var mode   = process.env.NODE_ENV || 'development';
var config  = require('../config/config.js')[mode];
var dbConf = config.db;

//Load any mongoose models here
var User = require('../models/user.js'); //user will load all sub models too

var mongoose = require('mongoose');
var dbURL = 'mongodb://' + dbConf.username + ':'+dbConf.pass + '@' + dbConf.host + ':'+dbConf.port+'/'+dbConf.database+'?'+dbConf.options;
mongoose.connect(dbURL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log('connected to database :: '+dbConf.database+' on '+dbConf.host+':'+dbConf.port+' as '+dbConf.username);
    console.log('=======================================================================');



    //var testUser = User.new(
    //    {email:"nickbolles@test.com",
    //        firstName:"Nick",
    //        password: "asdkfhwaiyu923iriuahewuifhaslef",
    //        passwordSalt:"asjdfjhk323123eaed32e",
    //        uuid: "00000-00000-00000-00000"
    //    });
    //
    //
    //console.log("Terms are currently: " + testUser.terms);
    ////testUser.addTerm({termName:"TestAddTerm",termId: "12313412312",termType:"Semester",termSDate: 124383,termEDate: 1233241,notes:"This is a new term"},function(err, newTerm) {
    ////    if (err) {
    ////        console.log(err);
    ////    } else {
    ////        console.log("Terms are currently: " + testUser.terms);
    ////        testUser.validate(function(err){
    ////            if (err){
    ////                console.log("User is invalid");
    ////            }
    ////            else{
    ////                console.log("user is valid");
    ////                testUser.save();
    ////            }
    ////        });
    ////        testUser.save();
    ////        testUser.addTerm({termName:"TestAddTerm",termId: "12313412312",termType:"Semester",termSDate: 124383,termEDate: 1233241,notes:"This is a new term"}, function(err, newTerm){
    ////            if (err){
    ////                console.log(err);
    ////            }else{
    ////                testUser.save();
    ////                setTimeout(function(){
    ////                    console.log("Test user is " + testUser);
    ////                    console.log("Test user.data is " + testUser.data.gpaapp[0]);
    ////                },1000);
    ////            }
    ////
    ////        });
    ////    }
    ////});


});

module.exports = db;