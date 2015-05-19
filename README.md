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
	urlset.load(__dirname + '/sitemap.json');

	var url	= urlset.url;

	// now, where we need to use link '/' we ca use:
	url.home();

	// we can add urls programmatically:
	urlset.add('/login','login');
	// now we have function:
	url.login(); //output: /login

	// we can create more complex urls:

	urlset.add('/item-${0}.html','item','news');
	// we have created function 'item' in section 'news':
	url.news.item(1234); //output: /item-1234.html
	// with extra params:
	url.news.item(1234,{lang:'fr',source:'fb'}); //output: /item-1234.html?lang=fr&source=fb

	//var alt_urlset = new urlset.Provider(); - create a new urlset

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
	url.home(); // with no params, output: '/'
	url.item(p0,p1); // with 2 params, output: '/item/p0-p1'
	url.accounts.profile(); // with no params, output: '/accounts/profile'
	url.accounts.photos(p0); // with one param, output: '/accounts/p0/photos'
	url.accounts.points(p0); // with one param, output: '/p0/points' !! link is absolute, so it don't adds '/accounts' prefix
	url.accounts.friends(p0); // with one param, output: '/accounts/p0/friends'
	url.account({name: 'uniq', lang: 'ru'}); // with one param, output: '/account-uniq?lang=ru'
```

All urls accept an extra param(object) for query: `url.home({lang:'ru',_ref:'home'})` -> `'/?lang=ru&_ref=home'`

## API

### urlset.url

`url` property keeps created urls structure.

### urlset.init(Object)
Inits urlset. Default configuration:
```
	{
		identifier: '$',
		params: [],
		formater: formats.json
	}
```

### urlset.load(String|[String])

Loads a file or a list of files containing urls configuration.


### urlset.add(String|Object,String[,String])

Adds a url to urlset: `urlset.add('/map','map','utils');` creates: `url.utils.map()`

## Special params

We can define global special params. Special params are useful for localization, for example.
If we want every link to add `lang` query param if `lang` is not default:
```
	urlset.add('/','home'); // added url home()
	urlset.setParam({name:'lang', value: 'en'});
	urlset.url.home({lang:'en'});
	//output: /
	urlset.url.home({lang:'ro'});
	//output: /?lang=ro
```

Param structure:
```
{
	name: string,		//param name, required
	value: ?,			//param default value
	useDefault: bool,	//if true - will use value for every url
	format:['s','q']	//'s' for start url, 'q' for query
}
```
More complex example:
```
	urlset.add('/','home'); // added url home()
	urlset.setParam({name:'lang', value: 'en', format: 's', useDefault: true});
	urlset.url.home();
	//output: /en/
	urlset.url.home({lang:'ro'});
	//output: /ro/
```

### urlset.setParam(param)

Sets a param

### urlset.removeParam(name:String)

Removes a param by name

### urlset.getParam(name:String)

Gets a param by name