var config = require('./config.js'),
	entropy = require('../index.js'),
	eyes = require('eyes'),
    entropyServer, port;

/*    
process.on('uncaughtException', function (err) {
	console.log('Test App: uncaughtException: ' + err);
});

process.on('SIGTERM', function () {
	console.log('Test App: SIGTERM:');
});
*/

// on Heroku, we must use their assigned port
port = process.env.PORT;
if (port) {
	console.log('Test: found a PORT env, setting port=' + port);
	config.port = port;
}

entropyServer = entropy(config);

if (entropyServer) {

	console.log('Test: entropyServer created; name is: ' + entropyServer.name());
	
	entropyServer.on('isListening', function(ctxt) {
		console.log('Test: entropyServer ' + ctxt.name + ' is listening on port ' + ctxt.port);
	});
} else {
	console.log('Test: ERROR: failed to create entropyServer');
}

