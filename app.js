
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , routes = {
               index: require('./routes').index,
               twelvecl: require('./routes/twelvecl.js').twelvecl,
               nesting: require('./routes/paths.js').nesting,
               stan: require('./routes/paths.js').stan
  }
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var server= http.createServer(app);
var io = require('socket.io').listen(server);


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
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
app.get('/users', user.list);
app.get('/twelvecl', routes.twelvecl);
app.get('/nesting', routes.nesting);
app.get('/stan', routes.stan);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function(socket) {
  socket.emit('news', {hello: 'world' });
  socket.on('test', function(data) {
    console.log(data);
  });
});
