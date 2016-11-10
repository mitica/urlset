'use strict';

var debug = require('debug')('urlset');
var utils = require('./utils');
var helpers = require('./helpers');

module.exports = function(path, url, options) {
	var countArgs = helpers.countArgs(url);
	var hasQuery = url.indexOf('?') > -1;

	return function() {
		var args = Array.prototype.slice.call(arguments);
		var extraParams = countArgs < args.length && utils.isObject(args[args.length - 1]) ? args[args.length - 1] : null;

		var aurl = path + url;

		// console.log('aici', path, url, args);

		if (args.length < countArgs || args.length > countArgs + 1) {
			//console.log('Inavlid arguments count on url', url, alist);
			throw new Error('Inavlid arguments count on url: ' + aurl);
		}
		var extraLength = extraParams === null ? 0 : 1;
		for (var i = 0; i < args.length - extraLength; i++) {
			aurl = aurl.replace(new RegExp('\\$\\{' + i + '\\}', 'g'), encodeURIComponent(args[i]));
		}

		if (extraParams) {
			debug('has extraParams', extraParams);
			var queryParams = {};
			var name;
			var value;
			for (name in extraParams) {
				value = extraParams[name];
				if (~aurl.indexOf('${' + name + '}')) {
					aurl = aurl.replace(new RegExp('\\$\\{' + name + '\\}', 'g'), encodeURIComponent(value));
				} else {
					queryParams[name] = value;
				}
			}

			var query = [];

			for (name in queryParams) {
				value = queryParams[name];
				var param = options.params[name];

				if (param) {
					debug('found param', name, param);
					// using default value
					if (param.value === value && param.useDefault !== true) {
						continue;
					}
					// start url
					if (param.format === 's') {
						aurl = '/' + value + aurl;
						continue;
					}
				}

				query.push(name + '=' + encodeURIComponent(value));
			}

			if (query.length > 0) {
				aurl += (hasQuery ? '&' : '?') + query.join('&');
			}
		}

		return aurl;
	};

};
