
var elasticsearch = require('elasticsearch');
          
          var client = new elasticsearch.Client({
            host: 'localhost:9200',
            log: 'trace'
          });    


var questionTopFun = function(socket, jsondata){
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
                  size: jsondata.qnum,                       
              }
            }, function (error, response) {
              var res = {
                  result:"ok",
                  questions: ""
                }

              if (error) {
                // handle error
                res.result = "failed";
                socket.emit('send:questions.top.res', res);  
                return;
              }
              //console.log("now search result = " + JSON.stringify(response));

                res.questions = response.hits.hits;
                /*
                var  searchres [];
                for(int i= 0; i< response.hits.hits.length; i++ ){
                    searchres.push
                }
                */

                socket.emit('send:questions.top.res', res);  

            });
}

var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;


MongoClient.connect('mongodb://127.0.0.1:27017/coredump', function(err, db) {
        if(err) throw err;



    var doMongodbOpt = function(socket, action, jsondata) {


        

///////////////////////////////////////case begin
        if(action == "askquestion"){
          //问一个问题
          //jsondata.asktime = new Date().toLocaleString();

          var collection = db.collection('questions');

          var moment = require('moment-timezone');
          var asktime = moment.tz(new Date(), "Asia/Shanghai").format();
           asktime = asktime.substring(0, asktime.indexOf('+'));

           jsondata.asktime = asktime;
          
          collection.insert(jsondata, function(err, doc) {
            // Locate all the entries using find
            if(err){
              console.log(err);
              console.log(doc);
              socket.emit('send:questions.ask.res', {"result": "failed"});             
            }else{
              console.log(doc);
              // Let's close the db              
                       

              //save data into ES index server
              var elasticsearch = require('elasticsearch');
              var client = new elasticsearch.Client({
                host: 'localhost:9200',
                log: 'trace'
              });

              //get computer id number
              // index a document
              jsondata._id = jsondata._id.toHexString();
              console.log("when index jsondata===" + JSON.stringify(jsondata));
              
              //delete jsondata["_id"];
              //jsondata._id = 1;
              client.index({
                index: 'questions',
                type: 'question', 
                id: jsondata._id,               
                body: jsondata
              }, function (error, response) {
                // ...
                var res = {
                  result: "",
                  id: jsondata._id
                }
                if(error){
                  console.log("index the ES data failed");
                  res.result = "failed";
                  socket.emit('send:questions.ask.res', res);          
                }else{
                  console.log("index the ES data ok");
                  res.result = "ok";                                  
                  socket.emit('send:questions.ask.res', res);  
                }

                client.close();

              });

            }
              
          });      
        }
        else if(action == "questions.question"){

          var collection = db.collection('questions');

          console.log("now questionid "+ jsondata.qid)
          ObjectID = require('mongodb').ObjectID;

          collection.findOne({_id: ObjectID.createFromHexString(jsondata.qid) }, function(err, document){
              if(err){
                console.log("findone error" + err);
                var res ={result:"failed"};
                socket.emit('send:questions.question.res', res);  
                return;
              }

              console.log(document);
              console.log(document.description);
                var res = {
                  result:"ok",
                  question: document
                }
                socket.emit('send:questions.question.res', res);  
            });
        }
        else if(action == "top"){
          questionTopFun(socket, jsondata);
          



        }
        else if(action == "newest"){
          // Locate all the entries using find
          //按提问时间排序最近提问的100个问题
          var collection = db.collection('questions');
          collection.find()
          .limit(100)
          .sort({asktime: -1})
          .toArray(function(err, results) {
            console.dir(results);        
            // Let's close the db
            db.close();
          });      
        }
        else if(action == "interesting"){
          //if user logined
          //and use search' key c++ redis
          //and user preperence and set node.js reids express
          //select where up's conditions.
           var collection = db.collection('questions'); 
          collection.find()
          .limit(100)
          .sort({asktime: -1})
          .toArray(function(err, results) {
            console.dir(results);        
            // Let's close the db
            db.close();
          });
        }else if(action == "interesting"){
          var collection = db.collection('questions');
           collection.find()
          .limit(100)
          .sort({asktime: -1})
          .toArray(function(err, results) {
            console.dir(results);        
            // Let's close the db
            db.close();
          });
        }else if(action == "featured"){
          
        }else if(action == "hot"){
          
        }else if(action == "week"){
          
        }else if(action == "month"){
          
        }else if(action == "questions.insertanswer"){
			var collection = db.collection('questions');
		    collection.findOne({_id: ObjectID.createFromHexString(jsondata.qid) }, function(err, document){
              if(err){
                console.log("findone error" + err);
                var res ={result:"failed"};
                socket.emit('send:questions.question.res', res);  
                return;
              }
			  var jsonobj=eval(document.answers);  
			  jsonobj[jsonobj.length] = jsondata;
				console.log('-----jsondata--->>>'+ JSON.stringify(jsondata) +'-----------answers--->>>>>'+ JSON.stringify(document.answers));
				collection.update({_id: ObjectID.createFromHexString(jsondata.qid)}, {$set:{answers:jsonobj}}, function(err) {
					if (err) {console.warn(err.message);}
					else{					  
						var res ={result:"reload"};
						socket.emit('send:questions.question.res', res);  
						return;
					 }
				});
            });
		}
///////////////////////////////////////case end
        
      
    }



exports.questionsAction = function(socket) {

//create ask question
        socket.on('send:questions.ask', function(data) {
              var tips = "to ask a question";
              console.log("server send:questions.ask rev:" + JSON.stringify(data));
              doMongodbOpt(socket, "askquestion",data);
              

        });

        socket.on('send:questions.question', function(data) {              
              console.log("server send:questions.question rev:" + JSON.stringify(data));
              doMongodbOpt(socket, "questions.question",data);
              

        });
		
		socket.on('send:questions.question.answer', function(data) {              
              console.log("server send:questions.answer rev:" + JSON.stringify(data));
              doMongodbOpt(socket, "questions.insertanswer",data);
              

        });


//Question query
        socket.on('send:questions.top', function(data) {             
              console.log("server send:questions.top rev:" + JSON.stringify(data));
              doMongodbOpt(socket, "top", data);              

        });
        socket.on('send:questions.newest', function(data) {
              var tips = "The newest questions";
              console.log("server rev:" + JSON.stringify(data));
              doMongodbOpt("newest",data);
              socket.emit('send:questions.interesting.res', '{"result": "ok"}');

        });

        socket.on('send:questions.interesting', function(data) {
              var tips = "questions that may be to interest to you base on your history and tag preference";
              console.log("server rev:" + JSON.stringify(data));
              doMongodbOpt("interesting",data);
              socket.emit('send:questions.interesting.res', '{"result": "ok"}');

        });

        socket.on('send:questions.featured', function(data) {
              var tips = "Questions with an active bounty";
               console.log("server rev:" + JSON.stringify(data));
               doMongodbOpt("featured",data);

                socket.emit('send:search.alarm.res', '{"result": "ok"}');

        });

        socket.on('send:questions.hot', function(data) {
               console.log("server rev:" + JSON.stringify(data));

                socket.emit('send:search.alarm.res', '{"result": "ok"}');

        });
        socket.on('send:questions.week', function(data) {
               console.log("server rev:" + JSON.stringify(data));

                socket.emit('send:search.alarm.res', '{"result": "ok"}');

        });
        socket.on('send:questions.month', function(data) {
               console.log("server rev:" + JSON.stringify(data));

                socket.emit('send:search.alarm.res', '{"result": "ok"}');

        });
};

});