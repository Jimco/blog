
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings')
  , flash = require('connect-flash');

var fs = require('fs')
  , accessLog = fs.createWriteStream('access.log', {flags: 'a'})
  , errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.logger({stream: accessLog}));
// app.use(express.json());
// app.use(express.urlencoded());
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/upload' }));
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.cookieSecret,
  cookie: { maxAge: 1000*60*60*24*30 },
  url: settings.url
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(err, req, res, next){
  var meta = '[' + new Date() + ']' + req.url + '\n';
  errorLog.write(meta + err.stack + '\n');
  next();
});

// development only
if('development' == app.get('env')){
  app.use(express.errorHandler());
}

// app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);
