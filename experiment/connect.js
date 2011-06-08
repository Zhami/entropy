var connect = require('connect'),
	eyes = require('eyes'),
	server;

	server = connect.createServer(function (req, res, next) {
		res.writeHead(200, {"Content-Type": "text/plain"})
		res.end('Hello from Connect');
	});
	
//	server.use(connect.logger());
//	server.use(connect['static'](__dirname + '/web'));	// 'static' is a reserved word
	
	
	server.listen(5000, function() {
console.log('server is listening on port 5000');
	});
