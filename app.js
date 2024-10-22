/**
 * Environment
 */
var db_path = "mongodb://samjalal:robin@linus.mongohq.com:10002/InternetServices"

/**
 * Module dependencies.
 */

var express = require('express')
  , mongoose = require("mongoose")
  , http = require('http')
  , path = require('path')
  , routes = require("./routes")
  , search = require('./routes/search');

var app = express();

db = mongoose.connect(db_path);

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/search', search.show);
app.post('/add', search.add);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

mongoose.connection.on('open', function() {
  console.log('Mongoose has opened a connection to '+ db_path);
});
