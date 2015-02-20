var utils = module.exports,
  _ = require('lodash');

utils.buildName = function(name, options) {
  var ns = name.split(options.separator || '.'),
    o = options.scope,
    val = options.value,
    i, len;
  for (i = 0, len = ns.length; i < len; i++) {
    var v = (i == len - 1 && val) ? val : {};
    o = o[ns[i]] = o[ns[i]] || v;
  }
  return o;
}

//http://stackoverflow.com/a/8817473/828615
utils.deepValue = function(obj, path) {
  for (var i = 0, path = path.split('.'), len = path.length; i < len; i++) {
    obj = obj[path[i]];
  };
  return obj;
};


utils.countArgs = function(url) {
  for (var i = 0; i < 21; i++) {
    if (url.indexOf('${' + i + '}') > -1)
      return i+1;
  }
  return 0;
};
