var config = require('../config/config.js');
var mode   = process.env.NODE_ENV || 'development';
var moment = require('moment');
var app    = require('../app');
var logSettings = config[mode].log,
    winston         = require('winston');
                      require('winston-mongodb').MongoDB;

    if (logSettings.db.url !== ''){
        options = {
            level: logSettings.db.logLevel,
            dbUri: logSettings.db.url
        };
        winston.add(winston.transports.MongoDB, options);
    }
module.exports.totalTime = 0;
module.exports.timer = function(){
    this.startTime= 0;
    this.endTime=0;
};
module.exports.timer.prototype.start = function() {
    this.startTime = moment();
    return this.startTime;
};
module.exports.timer.prototype.stop = function(){
    this.stopTime = moment();
    return this.stopTime;
};
module.exports.timer.prototype.getElapsed = function(){
  return moment() - this.startTime;
};

module.exports.sectionStart = function (from, vars){
    console.log('===================' + from + '===================');
    var string = '';
    for(var i=0;i<vars.length;i++){
        string += JSON.stringify(vars[i]) + ' ' ;
    }
    console.log(string);
    console.log('-----------------------------------------------------------');
};
module.exports.reqBegin = function(req,res,next){
    var startTime = moment();
    req.startTime = startTime;
    console.log('***********************************************************');
    console.log(req.url + ' Response Begin');
    console.log('TIMING--START: ' + startTime.format("H:mm:ss:SSS"));
    console.log('-----------------------------------------------------------');
    //Bind the resComplete function to the response finish event
    res.on('finish', function() {
        module.exports.resComplete(req,res,next);
    });
    next();
};
module.exports.resComplete = function(req,res,next){
    var ET =  moment();
    var ST = req.startTime;
    var fST = moment(ST).format("H:mm:ss:SSS");
    var fET = moment(ET).format("H:mm:ss:SSS");
    console.log('-----------------------------------------------------------');
    console.log('Response Complete ' + req.url);
    console.log('TIMING-- Start: ' + fST + ' End: ' + fET + ' Diff: ' + ET.diff(ST) + 'ms');
    console.log('***********************************************************');
    next();
};
