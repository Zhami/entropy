//
// (c) 2010 Stuart B. Malin -- All Rights Reserved
//
// License is hereby granted for the compilation and execution of this
// code by a Javascript interpreter embedded in a Web Browser operating
// at the behest of a human user. All other uses are prohibited, including,
// but not limited to, examination of this code to understand its operation.

//
// For information, contact:  stuart [at] SocialMediaIR [dot] com
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

var entropy,
	eyes = require('eyes'),
	nodeEventEmitter = require('events').EventEmitter,
	server = require('./server.js'),
	yhlogger = require('yhlogger'),
	support = require ('./support.js'),
	sys = require('sys'),
	// Constructors
	Entropy;

module.exports = entropy;


//============================================
Entropy = function (config) {
//============================================

	nodeEventEmitter.call(this);	// make this a Node EventEmitter
	
	this.config = config;
	this.flag = {
		isDebug:	false,
		isDevel:	false,
		isPublic:	true
	};
	this.htmlDir = '';
	this.httpServer = undefined;
	this.logDir = undefined;
	this.logger = undefined;
	this.myName = 'Entropy';
	this.serialNum = 0;
	this.server = undefined;
	this.init();
};

// inherit from node's events.EventEmmiter
sys.inherits(Entropy, nodeEventEmitter);


//--------------------------------------------
(function () {
	var	serialNum,
		// functions
		installServer, installLogger, processConfig;
//--------------------------------------------
	
	//------------------------------
	// static members & helper functions
	//------------------------------			
	
	serialNum = 1;
	
	//!!
	// apply or call these functions to set "this" !!
	
	//------------------------------
	installLogger = function () {
	//------------------------------
		this.logger = yhlogger({logDir: this.logDir});
	};
	
		
	
	//------------------------------
	installServer = function () {
	//------------------------------
		var	serverInstance, serverOpts,
			// functions
			getSelf;
		
		serverOpts = {
			htmlDir:	this.config.htmlDir,
			name:		this.myName,
			logger:		this.logger,
			port:		this.config.port
		};
		
		serverInstance = server(serverOpts);
		if (!serverInstance) {
			return false;
		}
		
		// use closure to capture this specific instance
		// (can't use a "self" var closure because the installHttpServer function can be invoked multiple times, and the "self" var will be for the last instance)
		getSelf = (function (self) {
			return function () {
				return self;
			};
		}(this));
		
		serverInstance.on('isListening', function (info) {
			var	name, port, self;
			
			self = getSelf();
			name = info.name;
			port = info.port;
			self.logger.info('Entropy: server for ' + name + ' listening on port ' + port);
			self.emit('isListening', {name: name,  port: port});
		});
		
		this.server = serverInstance;
		return true;
	};
	
	//------------------------------
	processConfig = function () {
	//------------------------------

		var	config, flags, s;
		
		config = this.config;
		
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
	};
	
	
	//------------------------------
	// public methods
	//------------------------------
	support.addMethods(Entropy.prototype, {
				
		name: function () {
			return this.myName;
		},
				
		init: function () {
			var	rez;
			// don't re-init
			if (this.serialNum) {
				return;
			}
			this.serialNum = serialNum;
			serialNum += 1;

			processConfig.call(this);
			installLogger.call(this);
			if (installServer.call(this)) {
console.log('Entropy: name= ' + this.myName + ': Server installed');
				this.server.listen();
				rez = true;
			} else {
				rez = false;
			}
			return rez;
		}
	});
}());


function entropy (config) {	
	return new Entropy(config);	
}

