var express =       require('express')
    , cons =        require('consolidate')
    , http =        require('http')
    , passport =    require('passport')
    , path =        require('path')
    , User =        require('./server/models/User.js');
var socketioservice = require('./server/routes/socketio.js');



var app = module.exports = express();
// assign the swig engine to .html files
app.engine('html', cons.ect);

// set .html as the default extension
app.set('view engine', 'html');
app.set('views', __dirname + '/client/views');

//app.set('views', __dirname + '/client/views');
//app.set('view engine', 'jade');
//xxx

app.use(express.logger('dev'))
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.cookieSession(
    {
        secret: process.env.COOKIE_SECRET || "Superdupersecret"
    }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(User.localStrategy);
//passport.use(User.twitterStrategy());  // Comment out this line if you don't want to enable login via Twitter
//passport.use(User.facebookStrategy()); // Comment out this line if you don't want to enable login via Facebook
passport.use(User.googleStrategy());   // Comment out this line if you don't want to enable login via Google
//passport.use(User.linkedInStrategy()); // Comment out this line if you don't want to enable login via LinkedIn

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

require('./server/routes.js')(app);

app.set('port', process.env.PORT || 8000);

var hserver = http.createServer(app);

hserver.listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(hserver);

io.sockets.on('connection', socketioservice.socketioservice);

require('./server/udpserver.js')(io);

///////////////////////////////Elasticsearch search api


var elasticsearch = require('elasticsearch');
          
          var client = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'trace'
          });    


var questionTopFun = function(httpres,  jsondata){
    // 主页 topest 100 question 
          //按提问时间排序最近提问的100个问题
          
          var userQuery = {};

          client.search({
              index: 'questions',
              type: 'question',                            
              body: {                
                  query: {
                    match_all: {}
                  } ,
                  size: jsondata.qnum                     
              }
            }, function (error, response) {
              var res = {
                  result:"ok",
                  questions: ""
                }

              var result = [];
                
              if (error) {
                // handle error
                res.result = "failed";                
              }else{
              	res.result = "ok"; 
              	for(var i= 0; i< response.hits.hits.length; i++ ){
                    result.push(response.hits.hits[i]._source);
                }
                res.questions = result;
              }
              //console.log("now search result = " + JSON.stringify(response));
               


                console.log("result ES ==" + JSON.stringify(res));
    			httpres.send(res);//给客户端返回一个json格式的数据
    			httpres.end();
                /*
                var  searchres [];
                for(int i= 0; i< response.hits.hits.length; i++ ){
                    searchres.push
                }
                */
            });
};

app.post('/top-questions', function(req, res, next) {
    console.log(req.body);//请求中还有参数data,data的值为一个json字符串
// var data= eval_r('(' + req.body.data + ')');//需要将json字符串转换为json对象
// console.log("data="+data.PhoneNumber);
    console.log(req.body.qnum);//解析json格式数据
    res.contentType('json');//返回的数据类型

    var data = req.body;
    

    questionTopFun(res, data);

    
});