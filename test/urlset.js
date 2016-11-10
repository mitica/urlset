'use strict';

var assert = require('assert');
var urlset = require('../lib');
var path = require('path');

describe('urlset', function() {

	it('should load a sitemap1.json', function() {
		urlset.load(path.join(__dirname, './data/sitemap1.json'));
		var links = urlset.url;

assert.equal('/', links)
	});

});
