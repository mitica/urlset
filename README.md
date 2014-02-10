# urlset

Application URLs model. Replacing static string URLs with hierarchical model.

## Problem

URLs in our apps are hard-coded.

## Solution

Building a hierarchical/readable model of URLs.
Instead of `'\home'` we can write `urls.home()`, or `'\profile\'+name+'\photos'` -> `urls.profile.photos(name)`

## Example

Using urlset is very simple:
```
	var path	= require('path');
	var urlset	= require('urlset');

	// sitemap.json contains configuration file for urlset
	urlset.load(__dirname + '/sitemap.json');

	var urls 	= urlset.urls;

	// now, where we need to use link '/' we ca use:
	urls.home();

	// we can add urls programmatically:
	urlset.add('/login','login');
	// now we have function:
	urls.login(); //output: /login

	// we can create more complex urls:

	urlset.add('/item-${0}.html','item','news');
	// we have created function 'item' in section 'news':
	urls.news.item(1234); //output: /item-1234.html
	// with extra params:
	urls.news.item(1234,{lang:'fr',source:'fb'}); //output: /item-1234.html?lang=fr&source=fb

```

## Configuration file

Configuration file(s) are in json format.

### Example
```
{
	"home": "/",
	"item": "/item/${0}-${1}",
	"@accounts": {
		"profile": "/profile",
		"photos": "/${0}/photos",
		"points":{
			"absolute":true,
			"url":"/${0}/points"
		},
		"friends": {
			"url": "/${0}/friends"
		}
	}
}
```

Every object key can be a url definition or a section. If a key starts with a '@' its a section.
This example creates:
```
	urls.home(); // with no params, output: '/'
	urls.item(p0,p1); // with 2 params, output: '/item/p0-p1'
	urls.accounts.profile(); // with no params, output: '/accounts/profile'
	urls.accounts.photos(p0); // with one param, output: '/accounts/p0/photos'
	urls.accounts.points(p0); // with one param, output: '/p0/points' !! link is absolute, so it don't adds '/accounts' prefix
	urls.accounts.friends(p0); // with one param, output: '/accounts/p0/friends'
```

All urls accepts an extra param(object) for query: `urls.home({lang:'ru',_ref:'home'})` -> `'/?lang=ru&_ref=home'`

## API

### urlset.urls

`urls` property keeps created urls structure.

### urlset.init(Object)
Inits urlset. Default configuration:
```
	{
		sectionChar: '@',
		specialParams: [],
		formater: formts.json
	}
```

### urlset.load(String|[String])

Loads a file or a list of files containing urls configuration.


### urlset.add(String|Object,String[,String])

Adds a url to urls: `urlset.add('/map','map','utils');` creates: `urls.utils.map()`

