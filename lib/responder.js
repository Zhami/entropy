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

var responder,
	eyes = require('eyes'),
	fs = require('fs'),
	nodeEventEmitter = require('events').EventEmitter,
	nowjs = require('now'),
	support = require ('./support.js'),
	sys = require('sys'),
	// Constructors
	Responder;

module.exports = responder;

//============================================
Responder = function (opts) {
//============================================
	nodeEventEmitter.call(this);	 //make this a Node EventEmitter

	this.everyone = undefined;	// nowJS everyone "pocket"
	this.logger = undefined;
	this.httpServer = undefined;
	this.serialNum = 0;
	
	this.init(opts);
};

// inherit from node's events.EventEmmiter
sys.inherits(Responder, nodeEventEmitter);	


//--------------------------------------------
(function () {
	var	serialNum,
		// functions
		installNowJS, processConfig;
//--------------------------------------------

	//------------------------------
	// static members & helper functions
	//------------------------------			
	
	serialNum = 1;
	
	//!!
	// apply or call these functions to set "this" !!
	
	
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
			console.log('Responder: [' + this.user.clientId + ']: connect: name= ' + this.now.name);
console.log('Responder: connect: this.now.receiveMessage= ' + this.now.receiveMessage);
		});

		everyone.on('disconnect', function() {
			var	self;
			self = getSelf();
			console.log('Responder: [' + this.user.clientId + ']: disconnect: name= ' + this.now.name);
		});
		
		everyone.now.distributeMessage = function(message){
			var	self;
			self = getSelf();
			console.log('Responder: [' + this.user.clientId + ']: distributeMessage received mssage from ' + this.now.name);
			
//			console.log('Responder: distributeMessage: this= ' + sys.inspect(this));
			
			self.everyone.now.receiveMessage(this.now.name, message);
		};
	};
	
	//------------------------------
	processOpts = function (opts) {
	//------------------------------
		var	s;
										
		s = opts.logger;
		if (s) {
			this.logger = s;
		}
		
		s = opts.httpServer;
		if (s) {
			this.httpServer = s;
		}

	};


	//------------------------------
	// public methods
	//------------------------------
	support.addMethods(Responder.prototype, {
						
		init: function (opts) {
			
			// don't re-init
			if (this.serialNum) {
				return;
			}
			this.serialNum = serialNum;
			serialNum += 1;

			processOpts.call(this, opts);
			
			installNowJS(this.httpServer);
			
			return true;
		}
		
	});
}());



function responder (opts) {
	return new Responder(opts);	
}

