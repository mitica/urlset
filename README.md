# urlset

Application URLs model. Replacing static string URLs with hierarchical model.

## Problem

URLs in our apps are hard-coded.

## Solution

Building a hierarchical/readable model of URLs.
Instead of `'\home'` we can write `url.home()`, or `'\profile\'+name+'\photos'` -> `url.profile.photos(name)`

## Usage

Using urlset is very simple:
```
	var path	= require('path');
	var urlset	= require('urlset');

	// sitemap.json contains configuration file for urlset
	var links = urlset(__dirname + '/sitemap.json');

	// now, where we need to use link '/' we ca use:
	links.home();
```

## Configuration file

Configuration file(s) are in json format.

#### Special names
1. `$url` - url format for current node;
2. `$name` - replace node name (by default is using node name for building url);
3. `$absolute` - `true` for not to use parent's name in path;
4. `$root` - reset as root, for childs;

### Example
```
{
	"home": "/",
	"item": "/item/${0}-${1}",
	"account": "/account-${name}",
	"accounts": {
		"profile": "/profile",
		"photos": "/${0}/photos",
		"points":{
			"$absolute":true,
			"$url":"/${0}/points"
		},
		"friends": {
			"$url": "/${0}/friends"
		}
	}
}
```
Every url in config file can be a string(like `"home": "/"`) or an object: `"friends": { "url": "/${0}/friends" }`.

This example creates:
```
	links.home(); // with no params, output: '/'
	links.item(p0,p1); // with 2 params, output: '/item/p0-p1'
	links.accounts.profile(); // with no params, output: '/accounts/profile'
	links.accounts.photos(p0); // with one param, output: '/accounts/p0/photos'
	links.accounts.points(p0); // with one param, output: '/p0/points' !! link is absolute, so it don't adds '/accounts' prefix
	links.accounts.friends(p0); // with one param, output: '/accounts/p0/friends'
	links.account({name: 'uniq', lang: 'ru'}); // with one param, output: '/account-uniq?lang=ru'
```

All urls accept an extra param(object) for query: `links.home({lang:'ru',_ref:'home'})` -> `'/?lang=ru&_ref=home'`

## API

### (files, options)

Creates a new links object.
