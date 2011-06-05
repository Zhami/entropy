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
	support = require ('./support.js'),
	sys = require('sys'),
	url = require('url'),
	urlParse = url.parse,
	// Constructors
	Responder;

module.exports = responder;

//============================================
Responder = function (opts) {
//============================================
	nodeEventEmitter.call(this);	 //make this a Node EventEmitter

	this.htmlDir = undefined;
	this.logger = undefined;
	this.httpRequestResponder = undefined;
	this.serialNum = 0;
	
	this.init(opts);
};

// inherit from node's events.EventEmmiter
sys.inherits(Responder, nodeEventEmitter);	


//--------------------------------------------
(function () {
	var	serialNum,
		// functions
		httpRequestResponder, processConfig;
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
	processOpts = function (opts) {
	//------------------------------
		var	s;
								
		s = opts.htmlDir;
		if (s) {
			this.htmlDir = s;
		}
	};


	//------------------------------
	// public methods
	//------------------------------
	support.addMethods(Responder.prototype, {
						
		init: function (opts) {
			var	me = this;
			
			// don't re-init
			if (this.serialNum) {
				return;
			}
			this.serialNum = serialNum;
			serialNum += 1;

			processOpts.call(this, opts);
			
			this.httpRequestResponder = (function () {
				// "me" is bound by closure to this instance
				return function (req, res) {
					httpRequestResponder(me, req, res);
				};
			}());
			
			return true;
		}
		
	});
}());



function responder (opts) {
	return new Responder(opts);	
}

