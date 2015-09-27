'use strict'
var _ = require('lodash')
  , superagent = require('superagent')
  , moment = require('moment')
  , ObjectId = require('mongoose').Types.ObjectId


// ***************
// IS helpers
// ***************

module.exports.is = {

  email: function(email){ 
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return re.test(email)
  },

  // no space, only letters & digits
  nick: function(value){ 
    return !(/\s/g.test(value)) && !(/[^a-z0-9]/gi).test(value) 
  },

  // has at least 1 uppercase letter
  upperCase: function(value){ 
    return (/[A-Z]/g.test(value)) 
  }

}



// ***************
// STRING helpers
// ***************

module.exports.string = {

  strip: {
    digits: function(value){ return value && value.replace(/[0-9]/g, '') },
    letters: function(value){ return value && value.replace(/[a-zA-Z]/g, '') },
    specials: function(value, keepSpace){ return value && value.replace(keepSpace ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g, '') },
    accents: function(value){ return _.deburr(value) },
  },

  keepOnly: {
    digits: function(value){ return value && value.replace(/[^0-9]/g, '') },
    letters: function(value){ return value && value.replace(/[^a-zA-Z]/g, '') },
  },

  has: {
    digits: function(value){ return /[0-9]/g.test(value) },
    letters: function(value){ return /[a-zA-Z]/g.test(value) },
    specials: function(value){ return /[^a-zA-Z0-9]/g.test(value) },
  },

  length: {
    min: function(value, min){ 
      return value && value.length >= min 
    },

    max: function(value, max){ 
      return value && value.length <= max 
    },
    
    between: function(value, min, max){ 
      return value && module.exports.string.length.min(value, min) && module.exports.string.length.max(value, max)
    }
  },

  capitalize: function(value, ucfirst){ 
    return (value||"").replace(
      ucfirst ? /(?:^|\s)\S/ : /(?:^|\s)\S/g, 
      function(txt){ return txt.toUpperCase(); }
    ) 
  },

  ucfirst: function(value, lower){ 
    return value.charAt(0).toUpperCase() + (lower ? value.slice(1) : value.slice(1).toLowerCase()) 
  },

  trim: function(value){ 
    return typeof value == 'string' ? value.replace(/^\s+|\s+$/g, '') : value 
  },

  random: function(len){ 
    var pos, charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', random  = ''; 
    for (var i = 0; i < (len||6); i++){ 
      pos = Math.floor(Math.random() * charSet.length)
      random += charSet.substring(pos, pos+1)
    } 
    return random
  },

  token: function(prefix){ 
    return (prefix || '') + require('crypto').createHash('md5').update(module.exports.string.random(8)).digest("hex") 
  },

  salt: function(){ 
    return Math.round((new Date().valueOf() * Math.random())) + '' 
  },

  encrypt: function(string, salt){ 
    return require('crypto').createHmac('sha1', salt).update(string).digest('hex') 
  },

  interpolate: function(string, o){
    return (string||'').replace(/{([^{}]*)}/g,
      function (a, b) {
        var r = o[b];
        return typeof r === 'string' || typeof r === 'number' ? r : a
      }
    )
  }

}



// ***************
// HTTP helpers
// ***************

module.exports.http = {

  // retry calling url until 200 is returned
  retry:  function (url, options, callback){
    var superagent = require('superagent')
    options = options || {}
    options.maxRetry = isNaN(options.maxRetry) ? 1 : options.maxRetry // number of time we recall url, default to 1
    options.totalRetry = options.totalRetry || 1

    superagent.get(url, function(err, res){
      if((err || res.statusCode !== 200) && options.maxRetry){
        options.totalRetry += 1
        options.maxRetry -= 1
        return module.exports.http.retry(url, options, callback)
      }
      callback(err, res, options.totalRetry)
    })
  },

  // debug http callback
  debug: function(err, res){ 
    if(err) console.log(res && res.body) 
  },

}



// ***************
// URL helpers
// ***************

module.exports.url = {

  // urlencode object
  // ex: encode({ a: 'b', c: 'd' }) => 'a=b&c=d'
  encode: function(obj){
    var str = []
    for(var p in obj)
      if (obj.hasOwnProperty(p)){
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    return str.join('&')
  },

  // append urlencoded params to url
  // ex: append('http://domain.com?a=b', { c: 'd' }) => 'http://domain.com?a=b&c=d'
  append: function(url, params){
    return url + (/\?/.test(url) ? '' : '?') + module.exports.url.encode(params)
  }
}



// ***************
// OBJECT helpers
// ***************

module.exports.object = {

  // return object value at given path
  // ex: valueAtPath({ a: { b: { c: 'd' } } }, 'a.b.c') => 'd'
  valueAtPath: function(obj, path){
    return [obj].concat(path.split('.')).reduce(function(prev, curr){
      if(!prev) return
      return prev[curr] instanceof ObjectId // ObjectId cannot be cloned
        ? prev[curr].toString()
        : _.cloneDeep(prev[curr])
    })
  }

}



// ***************
// ARRAY helpers
// ***************

module.exports.array = {

}



// ***************
// NUMBER helpers
// ***************

module.exports.number = {

  round: function(number, decimals){ 
    decimals = !decimals && decimals !== 0 ? 2 : 0
    return Math.round((number||0) * Math.pow(10, decimals)) / Math.pow(10, decimals) 
  },

  // only accept amount*100 (that's how they are saved in DB)
  // and return amount/100
  currency: function(amount, currencySign){
    if(amount === 0 && currencySign) return amount + currencySign
    if(!amount) return amount

    amount /= 100
    
    if(currencySign)
      isNaN(amount) 
        ? amount += currencySign 
        : amount = amount.toFixed(2).replace('.00', '') + currencySign

    return amount
  },

  // return random number
  random: function(len){ 
    var pos, charSet = '0123456789', random  = '';
    for (var i = 0; i < (len||6); i++){ 
      pos = Math.floor(Math.random() * charSet.length)
      random += charSet.substring(pos, pos+1) 
    } 
    return random
  },

  // percentage(10, 3) > 30
  percentage: function(value, rate){ 
    return value * rate / 100 
  },

  // sum the value of every key contained in a & b
  // deepSum({ a: { b: 5 }, c: 4 }, { a: { b: 1 }, c: 8 }) > { a: { b: 6 }, c: 8 }
  deepSum: function(a, b){
    if(!a) a = b
    else if(_.keys(b).length)
      _.each(_.keys(b), function(key){
        a[key] = module.exports.number.deepSum(a[key], b[key])
      })
    else if(!_.isObject(a) && !_.isObject(b))
      a = (a || 0) + (b || 0)

    return a
  },

  pad: function(number, pad, sign){ 
    return Array(Math.max(pad - String(number).length + 1, 0)).join(sign || 0) + number
  }

}



// ***************
// FORMAT helpers
// ***************

module.exports.format = {

  // clean device token
  // device('< 3445 5433 3345 3333 >') => '3445543333453333'
  device: function(device, platform){
    return platform == 'ios' 
      ? module.exports.string.strip.specials((device || '').toLowerCase()) 
      : device
  },

  name: function(value){
    value = value || ''

    value.replace(/\s{2,}/g, ' ')
         .replace(/[\\-_ ](?![\\-_ ])/g, '-')
         .replace(/-{2,}/g, '-') 

    value = module.exports.string.strip.digits(value)
    value = module.exports.format.firstName(value)
    value = module.exports.string.strip.specials(value)
    value = module.exports.string.trim(value)

    return value
  },

  firstName: function(value){ 
    return value && value.replace(/\s{2,}/g, ' ').replace(/[\\-_ ](?![\\-_ ])/g, '-').replace(/-{2,}/g, '-') 
  },

  lastName: function(value){ 
    return value && value.replace(/\s{2,}/g, ' ').replace(/-{2,}/g, '-') 
  },

  // phone: require('./phone'),

  // parsePhone: _.curry(phone)(_, _, true),

  cron: function(value){
    if(value == 'everyday')
      return '00 00 15 * * *'     // 15h everyday
    if(value == 'twice a month')
      return '00 00 15 01,15 * *' // 15h 1st and 15th day of each month
    if(value == 'start of month')
      return '00 00 15 01 * *'    // 15h 1st day of each month
    if(value == 'off')
      return ''
  },

  fromCron: function(value){
    if(value == '00 00 15 * * *')
      return 'everyday'
    if(value == '00 00 15 01,15 * *')
      return 'twice a month'
    if(value == '00 00 15 01 * *')
      return 'start of month'
    if(!value)
      return 'off'
  },

  deleteEmpty: function(value){
    return module.exports.string.trim(value) === ''
      ? undefined
      : value
  }

}



// ***************
// DATE helpers
// ***************

module.exports.date = {

  // return dates objects
  range: function(range, user){

    var start = moment().startOf('month')
      , end = moment().endOf('day')

    switch(range){
      case 'month':      start = moment().startOf('month'); end = moment().endOf('month'); break;
      case 'week':       start = moment().startOf('week'); end = moment().endOf('week'); break;
      case 'today':      start = moment().startOf('day'); end = moment().endOf('day'); break;
      case 'yesterday':  start = moment().startOf('day').add('day', -1); end = moment().endOf('day').add('day', -1); break;
      case 'last week':  start = moment().startOf('week').add('week', -1); end = moment().endOf('week').add('week', -1); break;
      case 'last month': start = moment().startOf('month').add('months', -1); end = moment().endOf('month').add('months', -1); break;
      default:
        if(range.start) start = (isNaN(range.start) ? moment(range.start) : moment.unix(range.start)).startOf('day')
        if(range.end) end = (isNaN(range.end) ? moment(range.end) : moment.unix(range.end)).endOf('day')
    }

    return {
        start: start
      , end: end
      , numberOfDays: end.diff(start, 'days') + 1
    }

  },

  // value type :
  //   - iso date
  //   - moment object
  //   - string pattern
  // return a moment object
  parse: function(value){
    var parsed = moment(value) // default
      , pattern = {
          6: { 'en': 'YYMMDD', 'fr': 'DDMMYY' },
          8: { 'en': 'YYYYMMDD', 'fr': 'DDMMYYYY' }
        }

    // valid iso date
    if(parsed.isValid() && parsed.toDate().toISOString() == value)
      return parsed

    value = value ? ''+value : ''
    value = module.exports.string.strip.specials(value)
    value = module.exports.string.strip.letters(value)
    value = module.exports.string.trim(value)

    // no pattern found
    if(!pattern[value.length])
      return parsed

    // test en pattern
    if(pattern[value.length].en) 
      parsed = moment(value, pattern[value.length].en)

    // test fr pattern
    if(!parsed.isValid() && pattern[value.length].fr) 
      parsed = moment(value, pattern[value.length].fr)

    // fix futuristic date
    // ex: 2035 will be 1935
    if(value.length == 6 && parsed.isValid() && parsed.isAfter()) 
      parsed.add(-100, 'years') 

    return parsed
 },

  birthdate: function(value){
    value = module.exports.date.parse(value)
    if(!value.isValid()) return value
    // add 12 hours to always have real date of birthdate
    return value.startOf('day').add(12, 'hour') 
  }

}



// ***************
// OBJECTID helpers
// ***************

module.exports.objectId = {

  // array can be :
  //  - array of objectId 
  //  - array of objects with objectId in it (in this case provide key where objectId is stored)
  // return objectid if found
  find: function(array, match, key){
    return _.find(array, function(id){ return (key ? id[key] : id).equals(match) })
  },

  cast: function(value){
    return ObjectId(value)
  }

}



// ***************
// PAGINATION helpers
// ***************

module.exports.pagination = {

  next: function(url, page, field){ 
    field = field || 'page'
    url = url.split('&'+field+'=')[0]
    return url + (/\?/.test(url) ? '&' : '?') + field + '=' + (page+1) 
  },

  prev: function(url, page, field){ 
    if(page==1) return null
    field = field || 'page'
    url = url.split('&'+field+'=')[0]
    return url + (/\?/.test(url) ? '&' : '?') + field + '=' + (page-1) 
  },

  pager: function(url, page, field){ 
    return { 
      next: module.exports.pagination.next(url, page, field), 
      prev: module.exports.pagination.prev(url, page, field) 
    } 
  }

}

