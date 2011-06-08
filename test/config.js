
var	config = {
	logDir:		'./log',
	name:		'Entropy Test',
	port:		8000,
	type:		'local',
	serverConfig:	{
		logFormat:	':remote-addr [:date] ":method :url :http-version" :status :res[Content-Length] bytes in :response-time ms',
		port:		5000
	},
	webConfig:	{
		// mount points must be absolute
		homePage:	__dirname + '/web/html/index.html',
		staticDir:	__dirname + '/web',
		favicon:	__dirname + '/web/img/favicon.ico',
	}
};

module.exports = config;

