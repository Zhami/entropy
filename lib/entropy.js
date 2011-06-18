var $ = require('jquery'),
	core = require('./core');

$(window).ready(function () {
	APP.name = prompt("What's your name?", "") || 'guest';  
	core.reportName();

	$("#send-button").click(function(){
		core.say($("#text-input").val());
		$("#text-input").val("");
	});

});


