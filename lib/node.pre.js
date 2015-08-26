var https = require('https');
var fs = require('fs');
var path = require('path');

var gui = false;

var Twitch, storage, initSession, parseFragment,
	config = {};

function param(array) {
	var i = 0;
	var result = '';

	for ( var name in array ) {
		if ( i != 0 ) {
			result += '&';
		}

		result += name + '=' + array[name];

		i++;
	}

	return result;
}