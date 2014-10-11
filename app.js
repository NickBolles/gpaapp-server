
var express         = require('express');
var consolidate     = require('consolidate');
var bodyParser      = require('body-parser');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var static          = require('serve-static');
var methodOverride  = require('method-override');
var moment          = require('moment');
var log             = require('./modules/log.js');
var token           = require('./modules/token-manager.js');

var app = express(function(){
    
});
var testing = true;

app.set('port', 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('t1', 0);
app.set('t2', 0);
app.engine("html", consolidate.handlebars);
app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
app.use(bodyParser({limit: '5mb'}));
app.use(bodyParser.json({ type: 'text/json', limit: '5mb' }));
app.use(cookieParser());
app.use(session({ secret: 'super-duper-secret-secret' }));
app.use(methodOverride());
app.use(static(__dirname + '/public'));
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Credentials" , true);
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();

});
app.use(function(req, res, next){
    console.log(JSON.stringify(req.headers) + JSON.stringify(req.cookies));
    if (req.method === 'OPTIONS'){
        console.log('OPTIONS URL ENDING res');
        res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
        res.send(200).end();
    }else{
        //console.log(JSON.stringify(res));
        if (req.path !== '/login' && req.path !== '/signup'){
            token.validate(req, res, function(e){
                if (e){
                    console.log('token Invalid, responding with error: ' + e);
                    //may need to be changed to send needed data
                    res.status(400).json({'message': e});
                    res.end;
                    if (testing){
                        console.log('***********************************************************');
                        console.log('Response Complete ' + 'ERROR FAILED TOKEN AUTHENTICATION');
                        console.log('***********************************************************');
                    }
                }
                else{
                    console.log('token Verified, continueing...');
                    next();
                }
            });
        }else{
            next();
        }
    }


});




require('./modules/router')(app);

var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});