

var moment = require('moment');


var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

var doMongodbOpt = function(jsondata) {
	MongoClient.connect('mongodb://127.0.0.1:27017/huanbao', function(err, db) {
    if(err) throw err;

	//convert temp from string to number
	jsondata.temp = Number(jsondata.temp);

	

    var collection = db.collection('alarms');
    collection.insert(jsondata, {w:1}, function(err, docs) {

      collection.count(function(err, count) {
        console.log(format("count = %s", count));
      });

      // Locate all the entries using find
      collection.find().toArray(function(err, results) {
        console.dir(results);
        // Let's close the db
        db.close();
      });
    });
  })
}


var doWorkingData = function(io,jsondata){
	if( jsondata.cmd == "trap"){
		console.log("fucking.....data="+jsondata);
		io.sockets.emit('send:lutang', jsondata);
	}
	else if(jsondata.cmd == "alarm"){
			//alarm will save to redis and es
			console.log("fuck.......mongo")
;			doMongodbOpt(jsondata);
	}
}


module.exports = function(io) {
	
	//create udp server
	var dgram = require("dgram");

	var server = dgram.createSocket("udp4");

	server.on("error", function (err) {
		console.log("server error:\n" + err.stack);
		server.close();
	});

	server.on("message", function (data, rinfo) {
		console.log("server got: " + data + " from " +
			rinfo.address + ":" + rinfo.port);


		var msg = data.toString();
		console.log('msg=' + msg);
		var jsondata = JSON.parse(msg);

		jsondata.ip = rinfo.address;
		//jsondata.alarmtime = new Date().getTime();
		jsondata.alarmtime = moment().format();
		
		console.log("Now change datetime=" + new Date(jsondata.alarmtime));

					
		switch(rinfo.address){
			case "192.168.1.168":
				doWorkingData(io, jsondata);

				break;
			case "192.168.1.169":
				io.sockets.emit('send:lukou',JSON.parse(msg));
				break;
			case "192.168.1.170":
				io.sockets.emit('send:ranshi2ru',JSON.parse(msg));
				break;
			case "192.168.1.171":
				io.sockets.emit('send:ranshi2chu',JSON.parse(msg));
				break;
			case "192.168.1.172":
				io.sockets.emit('send:budairu',JSON.parse(msg));
				break;
			case "192.168.1.173":
				io.sockets.emit('send:budaichu',JSON.parse(msg));
				break;				
		}
		

	});

	server.on("listening", function () {
		var address = server.address();
		console.log("server listening " +
			address.address + ":" + address.port);
	});

	server.bind(12345);
	// server listening 0.0.0.0:41234

}