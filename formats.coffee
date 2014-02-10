###
	default formats
###

exports.json=
	stringify: (obj, replacer, spacing)->
		JSON.stringify obj, replacer || null, spacing || 2
	parse: JSON.parse