var testing = true;

var config          = require('./config/config.js'),
    express         = require('express'),
    consolidate     = require('consolidate'),
    bodyParser      = require('body-parser'),
    cookieParser    = require('cookie-parser'),
    static          = require('serve-static'),
    methodOverride  = require('method-override'),
    moment          = require('moment'),
    dbConnection    = require('./modules/dbConnect'),
    UC              = require('./controllers/user.js'),
    User            = require('./models/user');
    //initialize express
    var app = module.exports = express();

global.mode = process.env.NODE_ENV = config.mode;
global.testing = (global.mode == 'development');
//now load the logger
var log             = require('./modules/log.js');
//set the app settings
app.set('port', config[global.mode].port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine("html", consolidate.handlebars);

app.set('t1', 0);
app.set('t2', 0);
app.locals.pretty = true;

//Declare middleware to be used
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
    app.use(bodyParser({limit: '5mb'}));
    app.use(bodyParser.json({ type: 'text/json', limit: '5mb' }));
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(methodOverride());
    app.use(express.static('public'));
    //app.use(app.router);
    //app.configure('development', function() {
    //    app.use(express.errorHandler({
    //        dumpExceptions: true,
    //        showStack: true
    //    }));
    //});

var passport = require('passport'),
    mongoose = require('mongoose');
global.mongooseSession = require('mongoose-session')(mongoose);
app.use(require('express-session')({
    key: 'sid',
    rolling: true, //Resets the expiration date whenever there is a connection
    secret: config.sessionId,
    store: global.mongooseSession
}));
app.use(passport.initialize());
app.use(passport.session());
// Initialize Passport
var initPassport = require('./auth/init');
initPassport(passport);

app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials" , true);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();

});

app.use('/', log.reqBegin);

var chat = require('./modules/chat');

var router = require('./modules/router')(app);

//error handling
app.use(function(err, req, res, next){
    console.log(err.stack);
    // additional logic, like emailing OPS staff w/ stack trace
});
var server = app.listen(app.get('port'), function () {
    console.log("Express server running in '" + global.mode + "' mode, listening on port " + app.get('port'));
});




