# Entropy Engine

Infrastructure layer for the EntropyJS Framework

## Installation

via [npm]

    npm install entropy

## Usage


	var config = require('./config.js'),
		entropy = require('../index.js'),
	    entropyServer;
	    
	entropyServer = entropy(config);
	
	console.log('entropyServer created; name: ' + entropyServer.name);


