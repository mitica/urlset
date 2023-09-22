"use strict";

var assert = require("assert");
var utils = require("../lib/utils");

describe("utils", function () {
	describe("#countArgs", function () {
		it("should throw error on no url", function () {
			assert.throws(function () {
				utils.countArgs();
			});
		});

		it("should throw error on invalid url", function () {
			assert.throws(function () {
				utils.countArgs(1);
			});
		});

		it("should return a number", function () {
			assert.equal(2, utils.countArgs("${1}, ${2}"));
			assert.equal(1, utils.countArgs("${1}, ${2"));
			assert.equal(1, utils.countArgs("${1}, ${a}"));
			assert.equal(0, utils.countArgs("/link"));
		});
	});
});
