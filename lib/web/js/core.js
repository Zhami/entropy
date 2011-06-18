var $ = require('jquery'),
	dnode = require('dnode');


module.exports = (function () {
	var	theRemote;
	
	dnode({
		someoneSays: function (name, msg) {
			console.log('someoneSays: [' + name + ']: ', msg);
	    	$('#says').text(name + ' says: ' + msg);
			console.log('someoneSays: theRemote=', theRemote);
		}
	}).connect(function (remote, conn) {
		console.log('core: connected with id=' + conn.id);
		console.log('core: remote=' + JSON.stringify(remote));
		theRemote = remote;
		conn.on('ready', function () {
			console.log('core: connection ready...');
		});
	});

	return {
		reportName: function () {
			theRemote.name(APP.name, function (says) {
		    	$('#says').text(says);
			});
		},
		say: function (msg) {
			theRemote.say(APP.name, msg, function (says) {
		    	$('#says').text(says);
			});
		}
	};
}());
