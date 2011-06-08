
var	config = {
	logDir:		'./log',
	name:		'Entropy Test',
	port:		8000,
	type:		'local',
	web:		{
		// mount points must be absolute __directory
		staticDir:	__dirname + '/web',
		favicon:	__dirname + '/web/img/favicon.ico',
		routes:	{
			'/':	__dirname + '/web/html/index.html'
		}
	}
};

module.exports = config;

