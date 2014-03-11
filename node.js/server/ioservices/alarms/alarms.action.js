
var moment = require('moment-timezone');
var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

    var doMongodbOpt = function(socket, action, jsondata) {
      MongoClient.connect('mongodb://127.0.0.1:27017/huanbao', function(err, db) {
        if(err) throw err;
        db.collection('alarms', function(err, collections){
          if(err) throw err;
          if(action == "list"){
          //list the alarm whith condition json data  
          // send:alarms.list rev:{"startdate":"1/14/2014 10:02:54 AM",
          //"enddate":"1/15/2014 10:02:54 AM",
          //"level": "high",
          //"orederprop":"alarmtime"}  

          

                  console.log("send:alarms.list==== startdate=:" + jsondata.startdate );

                  startdate = new Date(jsondata.startdate)
                  
                  enddate = new Date(jsondata.enddate)
                 // moment(startdate, "YYYY-MM-DDTHH:mm:ss")
                  //moment(enddate, "YYYY-MM-DDTHH:mm:ss")

                  startdate = moment.tz(startdate, "Asia/Shanghai").format(); 
                  enddate = moment.tz(enddate, "Asia/Shanghai").format(); 

                 

                  console.log("startdate="+startdate+"  enddate="+enddate + "noww=="+  moment(new Date()));

                  startdate = startdate.substring(0, startdate.indexOf('+'));
                  enddate = enddate.substring(0, enddate.indexOf('+'));
                  console.log("startdate="+startdate+"  enddate="+enddate + "noww=="+  moment(new Date()));

                  console.log("ISO ISO ==startdate="+startdate+"  enddate="+enddate + "noww=="+  moment(new Date()));


                  var orederprop = jsondata.orederprop;      
                  collections.find({
                    alarmtime: {'$gte': new Date(startdate), '$lte': new Date(enddate)},                            
                    level: jsondata.level 
                  })
                  .limit(100)
                  .sort({ orederprop : -1} )
                  .toArray(function(err, results) {
                      if(err){
                        socket.emit('send:alarms.list.res', {"result": "failed"});            
                      }else{
                        socket.emit('send:alarms.list.res', results);            
                      }
                      db.close();
                  }); 

                 
          }
          else if(action == "newest"){            
          }

        });        
      });
    }

exports.alarmsAction = function(socket) {

        socket.on('send:alarms.list', function(data) {
            console.log("send:alarms.list rev:" + JSON.stringify(data) );


            doMongodbOpt(socket, "list",data);
        });
};
