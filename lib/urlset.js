
/*
	urlset
 */

(function() {
  var argsCount, buildUrls, defaults, formatData, formatSPUrl, formats, fs, linkFn, normalizeUrl, provider, readFile, setUrlQParam, urlset, _,
    __slice = [].slice;

  formats = require("./formats");

  _ = require("lodash");

  fs = require("fs");

  defaults = {
    sectionChar: '@',
    params: [],
    formater: formats.json
  };

  provider = function(options) {
    return this.init(options);
  };

  provider.prototype.init = function(options) {
    this.clear();
    this._options = _.assign(defaults, options || {});
    return this;
  };

  provider.prototype.clear = function() {
    this._data = {};
    this.url = {
      $full: function(url, host) {
        return host + url;
      }
    };
    return this;
  };


  /*
  	Loads config/sitemap files
   */

  provider.prototype.load = function(files) {
    var self;
    if (_.isNull(files) || _.isUndefined(files)) {
      return this;
    }
    self = this;
    if (_.isString(files)) {
      files = [files];
    }
    if (_.isArray(files)) {
      _.forEach(files, function(f) {
        return self.loadData(readFile(f));
      });
    }
    this.buildUrls();
    return self;
  };

  provider.prototype.loadData = function(data) {
    if (_.isString(data)) {
      data = formatData(data, this._options.formater);
    }
    if (_.isObject(data)) {
      this._data = _.assign(this._data, data);
    } else {
      throw new Error('Invalid data to load: ' + JSON.stringify(data));
    }
    return this;
  };


  /*
  	Adds a url to urls object
   */

  provider.prototype.add = function(url, name, path) {
    var container, paths, prefix, self;
    if (!_.isString(name)) {
      throw new Error('url`s name is required!');
    }
    if (_.isString(url)) {
      url = {
        url: url
      };
    }
    url = _.assign({
      absolute: false,
      args: 0
    }, url);
    if (!_.isString(path)) {
      path = "";
    }
    paths = path.split('.');
    container = this.url;
    _.forEach(paths, function(pth) {
      if (_.isString(pth) && pth.length > 0) {
        if (_.isUndefined(container[pth])) {
          container[pth] = {};
        }
        container = container[pth];
      }
      return true;
    });
    url.args = argsCount(url.url);
    if (!url.absolute) {
      prefix = '';
      _.forEach(paths, function(pth) {
        if (_.isString(pth) && pth.length > 0) {
          return prefix += '/' + pth;
        }
      });
      url.url = prefix + url.url;
    }
    self = this;
    container[name] = function() {
      return linkFn(self, url, self._options, arguments);
    };
    return true;
  };


  /*
  	private method
   */

  provider.prototype.buildUrls = function() {
    buildUrls(this, this._data, '');
    return this;
  };


  /*
  	special params
   */

  provider.prototype.getParam = function(name) {
    var p, self;
    self = this;
    if (!_.isArray(self._options.params)) {
      return null;
    }
    p = null;
    _.forEach(self._options.params, function(param) {
      if (param.name === name) {
        p = param;
        return false;
      }
    });
    return p;
  };


  /*
  	sets a specil param
  	where @param can be: {name:'lang',value:'en',useDefault:false,format:'q'}
   */

  provider.prototype.setParam = function(param) {
    var p;
    if (!_.isObject(param)) {
      return false;
    }
    p = this.getParam(param.name);
    if (!_.isNull(p)) {
      this.removeParam(param.name);
    }
    this._options.params.push(param);
    return true;
  };

  provider.prototype.removeParam = function(name) {
    var p;
    p = this.getParam(param.name);
    if (!_.isNull(p)) {
      this._options.params.splice(this._options.params.indexOf(p), 1);
      return true;
    }
    return false;
  };


  /*
  	local private methods
   */

  buildUrls = function(nl, data, path) {
    _.forEach(data, function(value, name) {
      var sname;
      if (_.isString(value)) {
        nl.add(value, name, path);
      } else if (_.isObject(value)) {
        if (name.indexOf(nl._options.sectionChar) === 0) {
          sname = name.substring(1);
          if (path.length === 0) {
            path = sname;
          } else {
            path += '.' + sname;
          }
          buildUrls(nl, value, path);
        } else if (_.isString(value.url)) {
          nl.add(value, name, path);
        } else {
          throw new Error('invalid url config: ' + JSON.stringify(data));
        }
      } else {
        throw new Error('invalid url type: ' + JSON.stringify(data));
      }
      return true;
    });
    return true;
  };

  linkFn = function() {
    var args, data, nl, options, targs, url;
    nl = arguments[0], data = arguments[1], options = arguments[2], args = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    url = data.url;
    if (args.length > 0) {
      targs = [];
      _.forEach(args[0], function(v, i) {
        return targs.push(v);
      });
      args = targs;
    }
    if (data.args > args.length) {
      throw new Error("Not filled url params(" + data.args + "): " + url);
    }
    if (args.length === 0) {
      return normalizeUrl(nl, url, data, options, args);
    }
    if (data.args <= args.length) {
      _.forEach(args, function(v, i) {
        if (i < data.args) {
          url = url.replace(new RegExp("\\$\\{" + i + "\\}", "g"), v);
        }
        return true;
      });
      return normalizeUrl(nl, url, data, options, args);
    }
    throw new Error("invalid url: " + JSON.stringify(data));
  };

  normalizeUrl = function(nl, l, ld, options, args) {
    var esps, extra, sps;
    esps = [];
    if (ld.args < args.length && _.isObject(args[ld.args])) {
      extra = args[ld.args];
      _.forEach(extra, function(value, name) {
        var sp;
        sp = nl.getParam(name);
        if (_.isNull(sp)) {
          l = setUrlQParam(l, name, value);
        } else {
          sp = _.assign({
            format: 'q',
            useDefault: false
          }, sp);
          if (sp.useDefault === true) {
            esps.push(sp.name);
            l = formatSPUrl(l, sp, value);
          } else if (sp.value !== value) {
            l = formatSPUrl(l, sp, value);
          }
        }
        return true;
      });
    }
    sps = nl._options.params;
    if (sps.length > 0) {
      _.forEach(sps, function(sp) {
        if (!_.contains(esps, sp.name) && sp.useDefault === true && !(_.isUndefined(sp.value) || _.isNull(sp.value))) {
          l = formatSPUrl(l, sp, sp.value);
        }
        return true;
      });
    }
    return l;
  };

  formatSPUrl = function(l, sp, value) {
    if (sp.format === 's') {
      l = '/' + value + l;
    } else {
      l = setUrlQParam(l, sp.name, value);
    }
    return l;
  };

  setUrlQParam = function(url, pname, pvalue) {
    var prefix;
    prefix = _.contains(url, '?') ? '&' : '?';
    return url + prefix + pname + '=' + pvalue;
  };

  argsCount = function(url) {
    var i, _i;
    for (i = _i = 0; _i <= 20; i = ++_i) {
      if (!_.contains(url, "${" + i + "}")) {
        return i;
      }
    }
    return 0;
  };

  formatData = function(data, formater) {
    return formater.parse(data);
  };

  readFile = function(file) {
    var data;
    data = fs.readFileSync(file, {
      encoding: 'utf-8'
    });
    return data;
  };

  module.exports = urlset = new provider();

}).call(this);
