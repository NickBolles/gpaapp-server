
var express = require('express');
var consolidate = require('consolidate');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var static = require('serve-static');
var methodOverride = require('method-override');

var app = express();


app.set('port', 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine("html", consolidate.handlebars);
app.locals.pretty = true;
//	app.use(express.favicon());
//	app.use(express.logger('dev'));
app.use(bodyParser());
app.use(cookieParser());
app.use(session({ secret: 'super-duper-secret-secret' }));
app.use(methodOverride());
app.use(static(__dirname + '/public'));



require('./modules/router')(app);

var server = app.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});