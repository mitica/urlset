"use strict";

var utils = module.exports;

utils.isUndefined = function (target) {
	return target === undefined;
};

utils.isNull = function (target) {
	return target === null;
};

utils.isNullOrUnd = function (target) {
	return utils.isUndefined(target) || utils.isNull(target);
};

utils.isObject = function (target) {
	return typeof target === "object";
};

utils.isString = function (target) {
	return typeof target === "string";
};

utils.isArray = function (target) {
	return Array.isArray(target);
};

utils.assign = function (target, source) {
	for (var prop in source) {
		target[prop] = source[prop];
	}
	return target;
};

utils.buildName = function (name, options) {
	var ns = name.split(options.separator || "."),
		o = options.scope,
		val = options.value,
		i,
		len;

	for (i = 0, len = ns.length; i < len; i++) {
		var v = i === len - 1 && val ? val : {};
		o = o[ns[i]] = o[ns[i]] || v;
	}

	return o;
};

//http://stackoverflow.com/a/8817473/828615
utils.deepValue = function (obj, path) {
	path = path.split(".");
	var len = path.length;

	for (var i = 0; i < len; i++) {
		obj = obj[path[i]];
	}
	return obj;
};

utils.defaults = function (target, obj) {
	target = target || {};
	for (var prop in obj) {
		target[prop] = utils.isUndefined(target[prop]) ? obj[prop] : target[prop];
	}

	return target;
};

utils.countArgs = function (url) {
	return url.split(/\{\d+\}/g).length - 1;
};
