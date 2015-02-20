var urlset = require('../lib/urlset.js'),
  path = require('path');

urlset.init({debug: true}).load(__dirname + '/t1.json');

//console.log(urlset._data);
console.log(urlset.url);

console.log(urlset.url.home());
console.log(urlset.url.news());
console.log(urlset.url.news.item(12));
console.log(urlset.url.news.item2(12, 23));
console.log(urlset.url.news({
  ul: 'ro',
  param: '#$% ,./<>>?'
}));
console.log(urlset.url.news.id(121332));
console.log(urlset.url.news.id.old());
console.log(urlset.url.news.controls.places());
//console.log(urlset.url.news.item());
