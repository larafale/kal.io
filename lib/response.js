'use strict'

var http = require('http')
  , _ = require('lodash')
  , utils = require('../lib/utils')
  , $error = require('../lib/error')
  , config = require('./config')
 
// allow var param = req.val('myparam')
http.IncomingMessage.prototype.val = function(param, type, defaultValue){
  var value
    , self = this

  // (allow req.val('my.param'))
  _.each(['query', 'body', 'params'], function(source){
    if(utils.object.valueAtPath(self[source], param) 
    || utils.object.valueAtPath(self[source], param) === false 
    || utils.object.valueAtPath(self[source], param) === 0) 
        value = utils.object.valueAtPath(self[source], param)
  })
  
  if(type === 'string') value = typeof value !== 'undefined' ? '' + value : ''
  if(type === 'number') value = parseFloat(value, 10)
  if(value === 'true') value = true
  if(value === 'false') value = false

  return typeof defaultValue !== 'undefined' 
    ? value || defaultValue
    : value
}

http.IncomingMessage.prototype.find = function(param){
  if(this.query[param] || this.query[param] === false)
    return 'query'
  if(this.body[param] || this.body[param] === false)
    return 'body'
  if(this.params[param] || this.params[param] === false)
    return 'params'

  return 'body'
}

http.IncomingMessage.prototype.validate = function(fields){
  if(!fields) return this.validate_

  // fields is array
  if(_.isArray(fields)){
    for(var i=0; i<fields.length; i++){
      var f = fields[i]
        , s = this.body

      if(!s[f] && s[f] !== 0 && s[f] !== false){
        this.validate_ = { field: f, type: 'required' }
        return false
      }
    }

    return true
  }

  // fields is object
  if(_.isObject(fields)){
    for(var i=0; i<_.keys(fields).length; i++){
      var f = _.keys(fields)[i]
        , s = this.body
        , o = fields[f]

      // spec required
      if(o.required && !s[f] && s[f] !== 0 && s[f] !== false){
        this.validate_ = { field: f, type: 'required' }
        return false
      }
    }
    
    return true
  }



}



http.ServerResponse.prototype.respond = function(content, status, extra){
  // TODO
  // response was already sent in case of timeout
  // if(this.initialReq.timedout)
  //   return

  if(typeof status === 'undefined'){ // only one parameter found
    if(typeof content === 'number' || !isNaN(parseInt(content, 10))){ // usage "respond(status)"
      status = parseInt(content, 10)
      content = undefined
    }else{ // default status
      status = 200
    }
  }

  if(typeof(content) === 'string' && status < 400) content = { type: '_string', item: content }
  else if(_.isArray(content)) content = { type: '_list', items: content }
  else if(_.isBoolean(content)) content = { type: '_boolean', item: content }
  else if(status >= 400) content = { type: '_error', err: $error(content, extra, status) }
  else if(content) content = { type: '_object', item: content }
  else content = { type: '_empty' }

  content.statusCode = status

  if(extra) content = _.assign(content, _.omit(extra, 'type'))

  // default to JSON
  this.header('Content-Type', 'application/json; charset=UTF-8')

 

  this.status(status).send(content)
}