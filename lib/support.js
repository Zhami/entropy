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

var support,
	// Constructors
	Support;


//============================================
Support = function () {
//============================================
	this.name = 'support';
}

//--------------------------------------------
Support.prototype = (function () {
//--------------------------------------------
	
	//------------------------------
	// static members & helper functions
	//------------------------------			
	
	//!!
	// apply or call these functions to set "this" !!
		
	
	//------------------------------
	// public methods
	//------------------------------
	return {
		
		addMethods: function (o, methods) {
			var method;
			
			for (method in methods) {
				if (methods.hasOwnProperty(method)) {
					o[method] = methods[method];
				}
			}
		},
			
		 //use closure to capture the caller's "self" (they should call with "this")
		getGetSelf: function (self) {
			return function () {
				return self;
			};
		}

	};
}());

module.exports = new Support;


