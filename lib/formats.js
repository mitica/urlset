
/*
	default formats
 */

(function() {
  exports.json = {
    stringify: function(obj, replacer, spacing) {
      return JSON.stringify(obj, replacer || null, spacing || 2);
    },
    parse: JSON.parse
  };

}).call(this);
