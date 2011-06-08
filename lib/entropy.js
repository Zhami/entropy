//
// (c) 2010 Stuart B. Malin -- All Rights Reserved
//
// License is hereby granted for the compilation and execution of this
// code by a Javascript interpreter embedded in a Web Browser operating
// at the behest of a human user. All other uses are prohibited, including,
// but not limited to, examination of this code to understand its operation.

//
// For information, contact:  stuart [at] YellowHelium [dot] com
//

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.


// Declare global variables used (for JSLint)
/*global */

"use strict";

var connect = require('connect'),
	eyes = require('eyes'),
	nodeEventEmitter = require('events').EventEmitter,
	sys = require('sys'),
	// vars
	entropy,
	// functions
	installWebServer, processConfig,
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


//------------------------------
installWebServer = function () {
//------------------------------
	var	f, port, s, server, serverConfig, webConfig;
		
	webConfig = this.webConfig;
	
	serverConfig = this.serverConfig;
		
	server = connect.createServer();
	this.webServer = server;
	
	s = serverConfig.logFormat;
	if (s) {
		if (typeof s !== 'string') {
			s = '';		// if config value is true but not a string, then use default
		}
		server.use(connect.logger(s));
	}
	
	
	s = webConfig.favicon;
console.log('installWebServer: favicon ' + s);
	if (s) {
		server.use(connect.favicon(s));
	}

/*
	s = webConfig.staticDir;
console.log('installWebServer: staticDir ' + s);
	if (s) {
		server.use(connect['static'](s));	
		// odd invocation to appease JSLint because 'static' is a reserved word
	}
*/	
	s = webConfig.homePage;
console.log('installWebServer: homePage ' + s);
	if (s) {
		f = (function (pathToFile) {
			return function(app) {
				app.get('/', function(req, res, next){
					res.writeHead(200, {"Content-Type": "text/plain"});
					res.end('Hello there. I should serve you: ' + pathToFile);
				});
			};
		}(s));
		server.use(connect.router(f));
	}
	
	
	port = serverConfig.port || 8000;
console.log('installWebServer: port ' + port);
	
	server.listen(port, function() {
console.log('server is listening on port ' + port);
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

Entropy.prototype.init = function (config) {
	var	rez;

	processConfig.call(this, config);
	
	if (installWebServer.call(this)) {
console.log('Entropy [' + this.myName + ']: WebServer installed');
//		this.webServer.listen();
//		installResponder.call(this, this.webServer.getHttpServer());
		
		rez = true;
	} else {
		rez = false;
	}
	return rez;
};

Entropy.prototype.name = function () {
	return this.myName;
};

function entropy (config) {	
	return new Entropy(config);	
}

