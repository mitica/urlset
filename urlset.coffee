###
	urlset
###

formats = require "./formats"
_ = require "lodash"
fs = require "fs"


defaults=
	sectionChar: '@',
	specialParams: [],
	formater: formats.json


provider = (options)->
	return @init options

provider::init=(options)->
	@.clear()
	@._options=_.assign defaults, options||{}
	return @

provider::clear = ()->
	@._data = {}
	@.urls =
		$full: (url, host)->
			return host + url
	return @

###
	Loads config/sitemap files
###
provider::load=(files)->
	return @ if _.isNull(files) or _.isUndefined(files)

	#data={}
	self=@

	if _.isString files #one file
		files = [files]
	if _.isArray files #array of files
		_.forEach files, (f)->
			self.loadData readFile f   

	@.buildUrls()

	return self

provider::loadData=(data)->
	if _.isString data
		data = formatData data, @._options.formater
	if _.isObject data
		@._data = _.assign @._data, data
	else throw new Error 'Invalid data to load: ' + JSON.stringify data
	return @


###
	Adds a url to urls object
###
provider::add=(url, name, path)->
	#data={url:'/item',}
	#path=accounts.admin
	if not _.isString(name)
		throw new Error 'url`s name is required!'
	if _.isString url
		url = url:url
	url = _.assign {absolute: false, args: 0}, url
	if not _.isString path
		path = ""
	paths = path.split '.'
	#if _.isUndefined @.urls
	#	@.urls = {}
	container = @.urls
	_.forEach paths, (pth)->
		if _.isString(pth) and pth.length>0
			if _.isUndefined(container[pth])
				#console.log 'path = ' + pth
				container[pth] = {}
			container = container[pth]
		return true

	url.args = argsCount url.url
	#console.log 'url = ' + JSON.stringify url

	if not url.absolute
		prefix = ''
		_.forEach paths, (pth)->
			if _.isString(pth) and pth.length>0
				prefix += '/' + pth
		url.url = prefix + url.url

	self = @

	#console.log 'container = ' + JSON.stringify container

	container[name] = ()->
		return linkFn self, url, self._options, arguments

	return true

###
	private method
###
provider::buildUrls=()->
	buildUrls @, @._data, ''
	return @

###
	special params
###
provider::getSpecialParam=(name)->
	self = @
	if not _.isArray self._options.specialParams
		return null
	p = null;
	_.forEach self._options.specialParams, (param)->
		if param.name == name
			p = param
			return false
	return p

###
	sets a specil param
	where @param can be: {name:'lang',default:'en',useDefault:false,format:'q'}
###
provider::setSpecialParam=(param)->
	if not _.isObject param
		return false
	p = @.getSpecialParam param.name
	if _.isNull p
		@._options.specialParams.push param
	else
		@.removeSpecialParam param.name
		@._options.specialParams.push param
	return true

provider::removeSpecialParam=(name)->
	p = @.getSpecialParam param.name
	if not _.isNull p
		@._options.specialParams.splice @._options.specialParams.indexOf(p), 1
		return true
	return false
###
	local private methods
###

buildUrls = (nl, data, path)->
	#console.log 'buildLinks path='+path
	#console.log 'buildLinks data=' + JSON.stringify data
	_.forEach data, (value, name)->
		#console.log 'buildLinks forEach ('+value+', '+name+') path = '+path
		if _.isString value
			nl.add value, name, path
		else if _.isObject value
			if name.indexOf(nl._options.sectionChar) == 0
				#is section
				sname = name.substring 1
				if path.length == 0
					path = sname
				else path += '.' + sname
				
				buildUrls nl, value, path
			else if _.isString value.url
				nl.add value, name, path
			else throw new Error 'invalid url config: ' + JSON.stringify data
		else throw new Error 'invalid url type: ' + JSON.stringify data
		return true
	return true


linkFn=(nl,data,options,args...)->
	#console.log 'linkFn data='+JSON.stringify data
	url = data.url
	#console.log url
	if args.length>0
		targs=[]
		_.forEach args[0], (v,i)->
			targs.push v
		args=targs
	
	if data.args > args.length
		throw new Error "Not filled url params(" + data.args + "): " + url

	if args.length == 0
		return normalizeUrl nl, url, data, options, args
	#console.log 'args='+data.args+' params='+JSON.stringify args
	if data.args<=args.length
		_.forEach args, (v, i)->
			if i < data.args
				url = url.replace(new RegExp("\\$\\{"+i+"\\}","g"),v)
			return true
				
		return normalizeUrl nl, url, data, options, args

	throw new Error "invalid url: " + JSON.stringify data
	#return '/500'


normalizeUrl=(nl,l,ld,options,args)->
	#console.log 'normalize args = ' + JSON.stringify args

	esps=[]

	if ld.args<args.length and _.isObject(args[ld.args])
		#have extra params
		extra = args[ld.args]
		#console.log 'has extra ' + JSON.stringify extra
		_.forEach extra, (value, name)->
			sp = nl.getSpecialParam name
			#console.log 'sp='+JSON.stringify sp
			if _.isNull sp
				l = setUrlQParam l, name, value
			else
				sp = _.assign {format: 'q', useDefault: false}, sp
				if sp.useDefault == true
					esps.push sp.name
					l = formatSPUrl l, sp, value
				else if sp.default != value
					l = formatSPUrl l, sp, value
			return true
	sps = nl._options.specialParams
	if sps.length > 0
		_.forEach sps, (sp)->
			if not _.contains(esps, sp.name) and sp.useDefault == true and not (_.isUndefined(sp.default) or _.isNull(sp.default))
				l = formatSPUrl l, sp, sp.default
			return true



	return l

formatSPUrl=(l, sp, value)->
	if sp.format == 's'
		l = '/' + value + l
	else l = setUrlQParam l, sp.name, value
	return l


setUrlQParam=(url,pname,pvalue)->
	prefix = if _.contains url, '?' then '&' else '?'
	return url+prefix+pname+'='+pvalue

argsCount=(url)->
	for i in [0..20]
		if not _.contains url, "${" + i + "}"
			return i
	return 0


formatData=(data, formater)->
	return formater.parse data

readFile=(file)->
	data = fs.readFileSync file, encoding:'utf-8'
	return data


module.exports=urlset=new provider()

