'use strict';

var utils = require('./utils');
var fs = require('fs');

exports.countArgs = function(url) {
	return url.split(/\{\d+\}/g).length - 1;
};

exports.readFiles = function(files, formater) {
	if (!Array.isArray(files) && typeof files !== 'string') {
		throw new Error('`files` param is invalid');
	}

	files = Array.isArray(files) ? files : [files];
	var data = {};
	for (var i = 0; i < files.length; i++) {
		var content = fs.readFileSync(files[i], { encoding: 'utf-8' });
		content = formater.parse(content);
		utils.assign(data, content);
	}

	return data;
};
