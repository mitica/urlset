"use strict";

var assert = require("assert");
var urlset = require("../lib");

var sitemap1 = require("./data/sitemap1.json");
var sitemap2 = require("./data/sitemap2.json");

describe("urlset", function () {
	it("sitemap1.json: should load", function () {
		var links = urlset(sitemap1);
		// console.log(links);
		assert.equal("/", links.home());
		assert.equal("/accounts/1", links.accounts(1));
		assert.equal("/accounts/1", links.accounts.id(1));

		assert.equal("/1", links.news.id(1));

		assert.equal("/stories/1", links.stories.id(1));
	});

	it("sitemap1.json: should work with params", function () {
		var links = urlset(sitemap1, {
			params: {
				lang: {
					value: "en",
				},
				country: {
					value: "us",
					format: "s",
				},
			},
		});

		assert.equal("/", links.home());
		assert.equal("/", links.home({ lang: "en" }));
		assert.equal("/?lang=fr", links.home({ lang: "fr" }));

		assert.equal("/ru/accounts/1", links.accounts(1, { country: "ru" }));
		assert.equal(
			"/accounts/1",
			links.accounts.id(1, { country: "us", lang: "en" })
		);
		assert.equal(
			"/accounts/1?lang=ru",
			links.accounts.id(1, { country: "us", lang: "ru" })
		);

		assert.equal("/1", links.news.id(1));
		assert.equal("/1", links.news.id(1, { country: "us" }));

		assert.equal(
			"/topic/me?lang=ro",
			links.topic({ name: "me", country: "us", lang: "ro" })
		);

		assert.equal(
			"/search?ref=urlset&q=text&lang=ro",
			links.search({ q: "text", country: "us", lang: "ro" })
		);
	});

	it("sitemap2.json: should load", function () {
		var links = urlset(sitemap2);
		// console.log(links);
		assert.equal("/v2/", links.home());
		assert.equal("/accounts/1", links.accounts(1));
		assert.equal("/accounts/1", links.accounts.id(1));

		assert.equal("/1", links.news.id(1));

		assert.equal("/v2/stories/1", links.stories.id(1));
	});

	it("sitemap2.json: should work with params", function () {
		var links = urlset(sitemap2, {
			params: {
				lang: {
					value: "en",
				},
				country: {
					value: "us",
					format: "s",
				},
			},
		});

		assert.equal("/v2/", links.home());
		assert.equal("/v2/", links.home({ lang: "en" }));
		assert.equal("/v2/?lang=fr", links.home({ lang: "fr" }));

		assert.equal("/ru/accounts/1", links.accounts(1, { country: "ru" }));
		assert.equal(
			"/accounts/1",
			links.accounts.id(1, { country: "us", lang: "en" })
		);
		assert.equal(
			"/accounts/1?lang=ru",
			links.accounts.id(1, { country: "us", lang: "ru" })
		);

		assert.equal("/1", links.news.id(1));
		assert.equal("/1", links.news.id(1, { country: "us" }));

		assert.equal(
			"/v2/topic/me?lang=ro",
			links.topic({ name: "me", country: "us", lang: "ro" })
		);

		assert.equal(
			"/v2/search?ref=urlset&q=text&lang=ro",
			links.search({ q: "text", country: "us", lang: "ro" })
		);
		assert.equal(
			"/v2/search?ref=urlset&q=text",
			links.search({ q: "text", order: null })
		);
	});
});
