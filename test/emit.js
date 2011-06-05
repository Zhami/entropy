var emitter = require('./emitter.js'),
	eyes = require('eyes'),
    e;
    
/*
process.on('uncaughtException', function (err) {
	console.log('Test App: uncaughtException: ' + err);
});

process.on('SIGTERM', function () {
	console.log('Test App: SIGTERM:');
});
*/
    
e = emitter('MyEmitter');

if (e) {

	console.log('Emit: emitter created; name is: ' + e.name());
	e.on('testEvent', function (data) {
		console.log('Emit: emitter emitted testEvent and said: ' + data);
		eyes.inspect(this, 'Emit: on this=');
	});
	
	e.emitEvent('testEvent');
	
} else {
	console.log('Emit: ERROR: failed to create emitter');
}

