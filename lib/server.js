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

var server,
	http = require('http'),  
	nodeEventEmitter = require('events').EventEmitter,
	nowjs = require('now'),
	responder = require('./responder.js'),
	support = require ('./support.js'),
	sys = require('sys'),
	// Constructors
	Server;

module.exports = server;


//============================================
Server = function (opts) {
//============================================
	nodeEventEmitter.call(this);	 //make this a Node EventEmitter

	this.everyone = undefined;	// nowJS everyone "pocket"
	this.htmlDir = undefined;
	this.logger = undefined;
	this.port = 0;
	this.httpServer = undefined;
	this.serialNum = 0;
	this.myName = '?';
	
	this.init(opts);
};

// inherit from node's events.EventEmmiter
sys.inherits(Server, nodeEventEmitter);	


//--------------------------------------------
(function () {
	var	serialNum,
		// functions
		installHttpServer, installNowJS, processConfig;
//--------------------------------------------

	//------------------------------
	// static members & helper functions
	//------------------------------			
	
	serialNum = 1;
	
	//!!
	// apply or call these functions to set "this" !!

	//------------------------------
	installHttpServer = function () {
	//------------------------------
		var	httpServer, responderInstance, responderOpts, 
			// functions
			getSelf;
		
		 //use closure to capture this specific instance
		 //(can't use a "self" var closure because the installHttpServer function can be invoked multiple times, and the "self" var will be for the last instance)
		getSelf = (function (self) {
			return function () {
				return self;
			};
		}(this));	// invoking with "this" sets "self" of inner (returned) function
		
		responderOpts = {
			htmlDir:	this.htmlDir
		};
		
console.log('Server: installHttpServer: this.htmlDir= ' + this.htmlDir);		
		responderInstance = responder(responderOpts);
		
		httpServer = http.createServer(responderInstance.httpRequestResponder);
		
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
				
				console.log('ERROR: Server: EADDRINUSE for port ' + port);
				logger.error('Server: server for ' + name + ' EADDRINUSE for port ' + port);
//				self.close();
			}
		});


		return true;
	};

	//------------------------------
	installNowJS = function (httpServer) {
	//------------------------------
		var	everyone,
			// functions
			getSelf;
			
		 //use closure to capture this specific instance
		 //(can't use a "self" var closure because the installNowJS function can be invoked multiple times, and the "self" var will be for the last instance)
		getSelf = (function (self) {
			return function () {
				return self;
			};
		}(this));
		
		everyone = nowjs.initialize(httpServer);
		this.everyone = everyone;
		
		everyone.on('connect', function() {
			var	self;
			self = getSelf();
			console.log('Server: nowJS client connected: clientID: ' + this.user.clientID);
		});
		everyone.on('disconnect', function() {
			var	self;
			self = getSelf();
			console.log('Server: nowJS client DISconnected: clientID: ' + this.user.clientID);
		});
		
		everyone.now.distributeMessage = function(message){
			var	self;
			self = getSelf();
			self.everyone.now.receiveMessage(this.now.name, message);
		};
	};

	//------------------------------
	processOpts = function (opts) {
	//------------------------------
		var	s;
		
		s = opts.htmlDir;
console.log('Server: processOpts: htmlDir=' + s);
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
	support.addMethods(Server.prototype, {
				
		close: function () {
			var	httpServer;
			
			httpServer = this.httpServer;
			httpServer.close();
			this.httpServer = 0;
			this.emit('hasClosed', {name: name, port: port});
		},
		
		httpServer: function () {
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
				installNowJS(this.httpServer);
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
console.log('Server: server for ' + this.myName + ' called to listen on port=' + port);
			this.httpServer.listen(port, function () {
				var	self;
				self = getSelf();
console.log('Server: server for ' + self.myName + ' httpServer is listening on port=' + port);
				self.emit('isListening', {port: port});
console.log('Server: server for ' + self.myName + ' has emitted isListening event');
			});
		},
		
		name: function () {
			return this.myName;
		}
	});
}());


function server (opts) {
	return new Server(opts);	
}

