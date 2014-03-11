
 var myReplaceFunc = function(a,b){
   while(a.indexOf(b)!=-1){
    a=a.replace(b,'');
    
 }
 return a;
}


exports.actions = function(socket) {

        socket.on('send:jinliao', function(data) {
               console.log("server jinliao rev:" + data);

               data["ip"] = "192.168.1.168";
               //receive from web brower and sent to device udp port.
                var dgram = require('dgram');
                var strdata = JSON.stringify(data);
          console.log("str old old old old cmd="+ strdata);

          strdata = myReplaceFunc(strdata, "\\");
          console.log("str cmd===+++new +++++++========"+ strdata);
				var message = new Buffer(strdata);
				var client = dgram.createSocket("udp4");
				client.send(message, 0, message.length, 12346, "192.168.1.168", function(err, bytes) {

					console.log("send ok================= fucking set set action result="+ bytes);
				  client.close();
				});

        });

        socket.on('send:chuzha', function(data) {
               console.log("server chuzha rev:" + data);

               var ip = "192.168.1.168";
               //receive from web brower and sent to device udp port.
                var dgram = require('dgram');
                var strdata = JSON.stringify(data);
        		console.log("str cmd="+ strdata);
            strdata = myReplaceFunc(strdata, "\\");
          console.log("str cmd===+++new +++++++========"+ strdata);
				var message = new Buffer(strdata);
				var client = dgram.createSocket("udp4");
				client.send(message, 0, message.length, 12346, ip, function(err, bytes) {

					console.log("send chuzha ok  result="+ bytes);
				  client.close();
				});

        });

        socket.on('send:yinfengji', function(data) {
               console.log("server yinfengji rev:" + data);

               var ip = "192.168.1.168";
               //receive from web brower and sent to device udp port.
                var dgram = require('dgram');
                var strdata = JSON.stringify(data);
        		console.log("str cmd="+ strdata);
            strdata = myReplaceFunc(strdata, "\\");
          console.log("str cmd===+++new +++++++========"+ strdata);
				var message = new Buffer(strdata);
				var client = dgram.createSocket("udp4");
				client.send(message, 0, message.length, 12346, ip, function(err, bytes) {

					console.log("send ok  result="+ bytes);
				  client.close();
				});

        });

        socket.on('send:shuibeng', function(data) {
               console.log("server shuibeng rev:" + data);

               var ip =  "192.168.1.168";
               //receive from web brower and sent to device udp port.
                var dgram = require('dgram');
                var strdata = JSON.stringify(data);
        		console.log("str cmd="+ strdata);
            strdata = myReplaceFunc(strdata, "\\");
          console.log("str cmd===+++new +++++++========"+ strdata);
				var message = new Buffer(strdata);
				var client = dgram.createSocket("udp4");
				client.send(message, 0, message.length, 12346, ip, function(err, bytes) {

					console.log("send ok  result="+ bytes);
				  client.close();
				});

        });

        socket.on('send:settemp', function(data) {
               console.log("server settemp rev:" + data);

               var ip = "192.168.1.168";
               //receive from web brower and sent to device udp port.
                var dgram = require('dgram');
                var strdata = JSON.stringify(data);
        		console.log("str cmd="+ strdata);
            strdata = myReplaceFunc(strdata, "\\");
          console.log("str cmd===+++new +++++++========"+ strdata);
				var message = new Buffer(strdata);
				var client = dgram.createSocket("udp4");
				client.send(message, 0, message.length, 12346, ip, function(err, bytes) {

					console.log("send ok  result="+ bytes);
				  client.close();
				});

        });

        socket.on('send:gufengji', function(data) {
            console.log("server gufengji rev:" + data);

            var ip  = "192.168.1.168";
               //receive from web brower and sent to device udp port.
            var dgram = require('dgram');
            var strdata = JSON.stringify(data);
        		console.log("str cmd="+ strdata);
            strdata = myReplaceFunc(strdata, "\\");
            console.log("str cmd===+++new +++++++========"+ strdata);
    				var message = new Buffer(strdata);
    				var client = dgram.createSocket("udp4");
    				client.send(message, 0, message.length, 12346, ip, function(err, bytes) {

    					console.log("send ok  result="+ bytes);
    				  client.close();
    				});

        });        
};
