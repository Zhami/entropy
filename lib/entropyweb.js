/*
(c) 2010 Stuart B. Malin -- All Rights Reserved

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

For information, contact:  stuart [at] YellowHelium [dot] com
*/

// Declare global variables used (for JSLint)
/*global */

"use strict";

var browserify = require('browserify'),
	connect = require('connect'),
	dnode = require('dnode'),
	eyes = require('eyes'),
	fs = require('fs'),
	jsmin = require('jsmin'),
	nodeEventEmitter = require('events').EventEmitter,
	path = require('path'),
	sys = require('sys'),
	// vars
	entropy,
	// functions
	installWebServer, processConfig, startWebServer, startResponder, supplyFileAtPath,
	// Constructors
	Entropy;

module.exports = entropy;

//============================================
Entropy = function (config) {
//============================================

	nodeEventEmitter.call(this);	// make this a Node EventEmitter
	
	this.flag = {
		isDebug:	false,
		isDevel:	false,
		isPublic:	true
	};
	this.htmlDir = '';
	this.myName = 'Entropy';
	this.responder = undefined;
	this.webConfig = undefined;
	this.webServer = undefined;
	this.init(config);
	return this;
};

// inherit from node's events.EventEmmiter
sys.inherits(Entropy, nodeEventEmitter);

//============================================
// Local (private) methods
//============================================

//------------------------------
startResponder = function (server) {
//------------------------------
	dnode(function (client, conn) {
//		eyes.inspect(client, 'responder: client:');
//		eyes.inspect(conn, 'responder: conn:');
		this.cat = function (cb) {
			cb('meow');
		};
		this.name = function (name, cb) {
			console.log('responder: name invoked; name=' + name);
			eyes.inspect(client, 'client:');
			cb('hello ' + name);
		};
		this.say = function (name, msg, cb) {
			console.log('responder: say invoked; [' + name + ']:' + msg);
			client.someoneSays(name, msg);
		};
		conn.on('ready', function () {
			console.log('responder: connection ready for id=' + this.id);
			this.remote.someoneSays('system', 'hello');
		});
	}).listen(server);
};

//------------------------------
supplyFileAtPath = function (res, filePath) {
//------------------------------
	fs.readFile(filePath, 'utf8', function (err, data) {
		if (err) {
			res.writeHead(404, {"Content-Type": "text/plain"});
			res.end('Oops. Could not serve you: ' + pathToFile);
		} else {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end(data);
		}
	});
};


//------------------------------
installWebServer = function () {
//------------------------------
	var	f, opts, s, server, serverConfig, skinDir, webConfig;
		
	webConfig = this.webConfig;
	
	serverConfig = this.serverConfig;
		
	server = connect.createServer();
	this.webServer = server;
	
	skinDir = webConfig.skinDir;
	
	s = serverConfig.logFormat;
	if (s) {
		if (typeof s !== 'string') {
			s = '';		// if config value is true but not a string, then use default
		}
		server.use(connect.logger(s));
	}
	
	s =  __dirname + '/web';
	server.use(connect['static'](s));	
		// odd invocation to appease JSLint because 'static' is a reserved word

	s =  webConfig.skinDir;
	if (s) {
		server.use(connect['static'](s));	
		// odd invocation to appease JSLint because 'static' is a reserved word
	}
	
	s = webConfig.favicon;	
	if (s) {
console.log('installWebServer: favicon ' + s);
		server.use(connect.favicon(s));
	}

	server.use(connect.router(function (app) {
		app.get('/config', function(req, res, next) {
			s = 'webConfig: ' + JSON.stringify(webConfig);
			respondWithText(res, s);
		});

	}));
	
	server.use(browserify({
	    require:	['dnode', {jquery: 'jquery-browserify'}],
	    mount:		'/browserify.js',
	    filter:		jsmin.jsmin,
		base:		__dirname + '/web/js',
	    entry:		__dirname + '/entropy.js'
	}));
	
	server.use(function (req, res, next) {
console.log('server: nobody handled: ' + req.url);
		next();
	});

		
	return true;
};


//------------------------------
processConfig = function (config) {
//------------------------------

	var	flags, s;
		
	flags = this.flags;
	
	if (config.debug) {
		flags.isDebug = true;
	}
	
	if (config.type === 'devel') {
		flags.isDevel = true;
		flags.isPublic = false;
	} else if (config.type === 'public') {
		flags.isDevel = false;
		flags.isPublic = true;
	}
	
	s = config.logDir;
	if (s) {
		this.logDir = s;
	}
		
	s = config.name;
	if (s) {
		this.myName = s;
	}
	
	s = config.webConfig;
	if (s) {
		this.webConfig = s;
	}
	
	s = config.serverConfig;
	if (s) {
		this.serverConfig = s;
	}

};

//------------------------------
startWebServer = function () {
//------------------------------
	var	port, serverConfig;
		
	serverConfig = this.serverConfig;
	port = serverConfig.port || 8000;
console.log('startWebServer: port ' + port);
	
	this.webServer.listen(port, function() {
console.log('startWebServer: server is listening on port ' + port);
		this.emit('isListening', {name: this.name, port: this.port});
	});
};


//------------------------------
Entropy.prototype.init = function (config) {
//------------------------------
	var	rez;

	processConfig.call(this, config);
	
	if (installWebServer.call(this)) {
console.log('Entropy [' + this.myName + ']: WebServer installed');
//		this.webServer.listen();
//		installResponder.call(this, this.webServer.getHttpServer());
		startWebServer.call(this)
		startResponder(this.webServer);
		
		rez = true;
	} else {
		rez = false;
	}
	return rez;
};

//------------------------------
Entropy.prototype.name = function () {
//------------------------------
	return this.myName;
};

//============================================
function entropy (config) {	
	return new Entropy(config);	
}

