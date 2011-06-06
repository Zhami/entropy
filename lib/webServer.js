/*
 (c) 2010 Stuart B. Malin -- All Rights Reserved

 License is hereby granted for the compilation and execution of this
 code by a Javascript interpreter embedded in a Web Browser operating
 at the behest of a human user. All other uses are prohibited, including,
 but not limited to, examination of this code to understand its operation.


 For information, contact:  stuart [at] SocialMediaIR [dot] com


 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.
*/

// Declare global variables used (for JSLint)
/*global */

"use strict";

var webserver,
	http = require('http'),  
	fs = require('fs'),
	nodeEventEmitter = require('events').EventEmitter,
	nowjs = require('now'),
	support = require ('./support.js'),
	sys = require('sys'),
	url = require('url'),
	urlParse = url.parse,
	// Constructors
	WebServer;

module.exports = webserver;


//============================================
WebServer = function (opts) {
//============================================
	nodeEventEmitter.call(this);	 //make this a Node EventEmitter

	this.htmlDir = undefined;
	this.logger = undefined;
	this.port = 0;
	this.httpServer = undefined;
	this.serialNum = 0;
	this.myName = '?';
	
	this.init(opts);
};

// inherit from node's events.EventEmmiter
sys.inherits(WebServer, nodeEventEmitter);	


//--------------------------------------------
(function () {
	var	serialNum,
		// functions
		httpRequestResponder, installHttpServer, processOpts;
//--------------------------------------------

	//------------------------------
	// static members & helper functions
	//------------------------------			
	
	serialNum = 1;
	
	//!!
	// apply or call these functions to set "this" !!

	//------------------------------
	httpRequestResponder = function(self, req, res) {
	//------------------------------
		var	fileSpec, urlObj, pathname;
		
		urlObj = urlParse(req.url);
		pathname = urlObj.pathname;
		
console.log('httpRequest: pathname: ' + pathname);
		if (pathname === '/favicon') {
			res.writeHead(404); 
		} else if (pathname === '/hello') {
			fileSpec = self.htmlDir + '/helloworld.html';
console.log('httpRequest: fileSpec= ' + fileSpec);
			fs.readFile(fileSpec, function(err, data) {
				if (err) {
//FIXME!
console.log('httpRequest: fs read error for fileSpec= ' + fileSpec);
					res.writeHead(200, {'Content-Type': 'text/html'}); 
					res.end('<h1> FS READ ERROR </h1><p>fileSpec=' + fileSpec +'</p>'); 
				} else {
console.log('httpRequest: fs read file; writing data... ');
					res.writeHead(200, {'Content-Type':'text/html'}); 
					res.write(data);  
					res.end();
				}
			});
		} else {
			res.writeHead(200, {'Content-Type': 'text/html'}); 
			res.end('<h1>Responder...</h1><p>Can not handle your request for: ' + pathname + '</p>'); 
		}
	};
	
	//------------------------------
	installHttpServer = function () {
	//------------------------------
		var	httpServer, responderInstance, responderOpts, 
			// functions
			getSelf, httpRequestResponderProxy;
		
		 //use closure to capture this specific instance
		 //(can't use a "self" var closure because the installHttpServer function can be invoked multiple times, and the "self" var will be for the last instance)
		getSelf = (function (self) {
			return function () {
				return self;
			};
		}(this));	// invoking with "this" sets "self" of inner (returned) function
				
		httpRequestResponderProxy = (function () {
			return function (req, res) {
				httpRequestResponder(getSelf(), req, res);
			};
		}());
		
		httpServer = http.createServer(httpRequestResponderProxy);
		
		if (!httpServer) {
			return false;
		}
		
		this.httpServer = httpServer;
		
		httpServer.on('error', function (e) {
			var	self;
			
			self = getSelf();
			
			if (e.code === 'EADDRINUSE') {
				var	name, port;
				name = self.myName;
				port = self.port;
				
				console.log('ERROR: WebServer: EADDRINUSE for port ' + port);
				logger.error('WebServer: server for ' + name + ' EADDRINUSE for port ' + port);
//				self.close();
			}
		});


		return true;
	};


	//------------------------------
	processOpts = function (opts) {
	//------------------------------
		var	s;
		
		s = opts.htmlDir;
		if (s) {
			this.htmlDir = s;
		}
		
		s = opts.name;
		if (s) {
			this.myName = s;
		}

		s = opts.port;
		if (s) {
			this.port = s;
		}
		
		s = opts.logger;
		if (s) {
			this.logger = s;
		}
	};

	//------------------------------
	// public methods
	//------------------------------
	support.addMethods(WebServer.prototype, {
				
		close: function () {
			var	httpServer;
			
			httpServer = this.httpServer;
			httpServer.close();
			this.httpServer = 0;
			this.emit('hasClosed', {name: name, port: port});
		},
		
		getHttpServer: function () {
			return this.httpServer;
		},
		
		init: function (opts) {
			var	rez;
			// don't re-init
			if (this.serialNum) {
				return;
			}
			this.serialNum = serialNum;
			serialNum += 1;

			processOpts.call(this, opts);

			if (installHttpServer.call(this)) {
				rez = true;
			} else {
				rez = false;
			}
			return rez;
		},
		
		listen: function (port) {
			var	getSelf;
			getSelf = (function (self) {
				return function () {
					return self;
				};
			}(this));
			
			port = port || this.port;
console.log('WebServer: server for ' + this.myName + ' called to listen on port=' + port);
			this.httpServer.listen(port, function () {
				var	self;
				self = getSelf();
console.log('WebServer: server for ' + self.myName + ' httpServer is listening on port=' + port);
				self.emit('isListening', {port: port});
console.log('WebServer: server for ' + self.myName + ' has emitted isListening event');
			});
		},
		
		name: function () {
			return this.myName;
		}
	});
}());


function webserver (opts) {
	return new WebServer(opts);	
}

