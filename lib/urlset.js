var
  formats = require('./formats'),
  fs = require('fs'),
  _ = require('lodash'),
  utils = require('./utils.js'),
  defaults = {
    identifier: '$',
    params: [],
    formater: formats.json
  };

var provider = function(options) {
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
  var self = this;
  if (_.isNull(files) || _.isUndefined(files)) {
    return this;
  }

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
  var container, paths, prefix, self = this;
  if (!_.isString(name)) {
    throw new Error('url`s name is required!');
  }
  if (_.isString(url)) {
    url = {
      url: url
    };
  }
  url = _.assign({
    absolute: false
  }, url);
  if (!_.isString(path) || path.length < 1)
    path = name;
  else
    path += '.' + name;

  if (url.url[0] != '/') url.url = '/' + url.url;

  url.args = utils.countArgs(url.url);

  function fn() {
    var alist = Array.prototype.slice.call(arguments),
      aparams = url.args < alist.length && _.isObject(alist[alist.length - 1]) ? alist[alist.length - 1] : {},
      aurl = url.url;

    if (alist.length < url.args || alist.length > url.args + 1) {
      //console.log('Inavlid arguments count on url', url, alist);
      throw new Error('Inavlid arguments count on url: ' + url.url);
    }

    _.forEach(alist, function(v, i) {
      if (i < url.args) {
        aurl = aurl.replace(new RegExp("\\$\\{" + i + "\\}", "g"), v);
      }
    });
    return normalizeUrl(self, aurl, url, aparams);
  }

  utils.buildName(path, {
    scope: this.url,
    value: fn
  });
  //console.log('added url: ', path, url);
  return this;
};


/*
  private method
 */

provider.prototype.buildUrls = function() {
  var self = this;
  buildUrls(this, this._data);
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


/**
 * sets a specil param
 * where @param can be: {name:'lang',value:'en',useDefault:false,format:'q'}
 */

provider.prototype.setParam = function(param) {
  if (!_.isObject(param))
    return false;

  this.removeParam(param.name);

  this._options.params.push(param);
  return true;
};

provider.prototype.removeParam = function(name) {
  var p = this.getParam(name);
  if (p) {
    this._options.params.splice(this._options.params.indexOf(p), 1);
    return true;
  }
  return false;
};


/*
  local private methods
 */

function buildUrls(self, data, path, names) {
  path = path || [];
  names = names || [];
  var identifier = self._options.identifier;

  function add(scope, value, name) {
    var url = {
      url: value,
      absolute: scope[identifier + 'absolute'] == true
    };
    if (!url.absolute)
      url.url = path.join('/') + url.url;

    self.add(url, name, names.join('.'));
  }

  _.forEach(data, function(value, name) {
    if (name == identifier + 'name') {
      path.push(value);
      return;
    }
    if (name[0] == identifier) return;
    if (_.isString(value)) {
      add(data, value, name);
    } else if (_.isObject(value)) {
      if (_.isString(value[identifier + 'url'])) {
        add(value, value[identifier + 'url'], name);
      }

      if (!data[identifier + 'name']) {
        path.push(name);
      }
      names.push(name);

      buildUrls(self, value, path, names);
    }
  });
}

function normalizeUrl(self, url, urlData, params) {
  var usedParams = [];
  //fill extra params:
  if (_.isObject(params)) {
    for (name in params) {
      var value = params[name],
        param = self.getParam(name);
      //is a special param:
      if (param) {
        if (param.useDefault === true) {
          usedParams[param.name];
          url = formatSPUrl(url, param, value);
        } else if (param.value !== value) {
          url = formatSPUrl(url, param, value);
        }
      } else { //set as query param:
        url = setUrlQParam(url, name, value);
      }
    }
  }

  var sparams = self._options.params;
  if (sparams.length > 0) {
    _.forEach(sparams, function(param) {
      if (!_.contains(usedParams, param.name) && param.useDefault === true && !(_.isUndefined(param.value) || _.isNull(param.value))) {
        url = formatSPUrl(url, param, param.value);
      }
    });
  }

  return url;
}

function formatSPUrl(url, param, value) {
  if (param.format === 's') {
    url = '/' + value + url;
  } else {
    url = setUrlQParam(url, param.name, value);
  }
  return url;
}

function setUrlQParam(url, name, value) {
  var prefix = _.contains(url, '?') ? '&' : '?';
  return url + prefix + name + '=' + encodeURIComponent(value);
}

function formatData(data, formater) {
  return formater.parse(data);
}

function readFile(file) {
  var data;
  data = fs.readFileSync(file, {
    encoding: 'utf-8'
  });
  return data;
}

module.exports = new provider();
