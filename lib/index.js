'use strict';

var debug = require('debug')('urlset');
var utils = require('./utils');
var helpers = require('./helpers');
var fn = require('./fn');

var DEFAULTS = {
	identifier: '$',
	params: {},
	formater: require('./formats').json
};

var internal = {};

module.exports = function(data, options) {
	options = utils.defaults(options, DEFAULTS);

	var links = {};

	internal.load(links, data, options);

	return links;
};

internal.load = function(links, data, options) {
	if (utils.isNullOrUnd(data)) {
		throw new Error('Param `data` is required');
	}
	if (typeof data !== 'object') {
		data = helpers.readFiles(data, options.formater);
	}
	internal.buildLinks(links, data, options);
};

//
//

internal.buildLinks = function(target, data, options, path, nodeName) {
	path = path || '';
	var name = data[options.identifier + 'name'];
	var url = data[options.identifier + 'url'];
	var isAbsolute = data[options.identifier + 'absolute'];
	var isRoot = data[options.identifier + 'root'];
	var value;

	if (isRoot) {
		path = '';
	}

	// in a news node
	if (nodeName) {
		if (url) {
			debug('nodeName url', url);
			path = isAbsolute ? '' : (path + '/' + nodeName);
			target = target[nodeName] = fn(path, url, options);
		} else {
			debug('build new node', nodeName);
			path = path + '/' + nodeName;
			target = target[nodeName] = {};
		}
	}

	for (var prop in data) {
		if (prop[0] !== options.identifier) {
			value = data[prop];
			name = name || prop;

			// is new node
			if (utils.isObject(value)) {
				debug('new node', path, prop, value);
				internal.buildLinks(target, value, options, path, prop);
			} else if (utils.isString(value)) {
				debug('new fn', prop, value);
				target[prop] = fn(path, value, options);
			} else {
				throw new Error('invalid node: ' + prop);
			}
		}
	}
};
