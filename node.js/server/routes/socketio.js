
var questions = require('../ioservices/questions/questions.action.js');
var alarms = require('../ioservices/alarms/alarms.action.js');
var actions = require('../ioservices/actions/actions.js');


exports.socketioservice = function(socket) {

		questions.questionsAction(socket);

		
        alarms.alarmsAction(socket);
        actions.actions(socket);
};

