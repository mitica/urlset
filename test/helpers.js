'use strict';

var assert = require('assert');
var helpers = require('../lib/helpers');

describe('helpers', function() {

	describe('#countArgs', function() {

		it('should throw error on no url', function() {
			assert.throws(function() {
				helpers.countArgs();
			});
		});

		it('should throw error on invalid url', function() {
			assert.throws(function() {
				helpers.countArgs(1);
			});
		});

		it('should return a number', function() {
			assert.equal(2, helpers.countArgs('${1}, ${2}'));
			assert.equal(1, helpers.countArgs('${1}, ${2'));
			assert.equal(1, helpers.countArgs('${1}, ${a}'));
			assert.equal(0, helpers.countArgs('/link'));
		});

	});
});
