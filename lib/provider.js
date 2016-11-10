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

var Provider = module.exports = function(options) {
	return this.init(options);
};

Provider.prototype.init = function(options) {
	this.options = utils.defaults(options, DEFAULTS);
	var self = this;

	if (utils.isArray(this.options.params)) {
		this.options.params.forEach(function(param) {
			self.setParam(param);
		});
	}

	this.clear();

	return this;
};

Provider.prototype.clear = function() {
	this.data = {};
	this.url = {
		$full: function(url, host) {
			return host + url;
		}
	};
	return this;
};

Provider.prototype.load = function(data) {
	if (utils.isNullOrUnd(data)) {
		throw new Error('Param `data` is required');
	}
	if (typeof data !== 'object') {
		data = helpers.readFiles(data, this.options.formater);
	}
	internal.buildUrl(this.url, data, this.options);

	return this;
};

Provider.prototype.setParam = function(param) {
	if (!utils.isObject(param)) {
		throw new Error('invalid param `param`');
	}
	if (!utils.isString(param.name)) {
		throw new Error('invalid param `param.name`');
	}

	param = utils.defaults(param, { useDefault: false, format: 'q' });

	this.options.params[param.name] = param;

	return this;
};

Provider.prototype.removeParam = function(name) {
	delete this.options.params[name];
	return this;
};

//
//

internal.buildUrl = function(target, data, options, path, nodeName) {
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
			target = target[nodeName] = fn(isAbsolute ? '' : path, url, options);
		} else {
			debug('build new node', nodeName);
			target = target[nodeName] = {};
		}
	}

	for (var prop in data) {
		if (prop[0] !== options.identifier) {
			value = data[prop];
			name = name || prop;

			// is new node
			if (utils.isObject(value)) {
				debug('new node', prop, value);
				internal.buildUrl(target, value, options, path, prop);
			} else if (utils.isString(value)) {
				debug('new fn', prop, value);
				target[prop] = fn(isRoot ? path : path + '/' + prop, value, options);
			} else {
				throw new Error('invalid node: ' + prop);
			}
		}
	}
};
