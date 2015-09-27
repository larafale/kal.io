var _ = require('lodash')
var utils = require('./utils')

var errors = {

  1: {
    title: 'champs requis',
    message: 'paramètre "{slug}" manquant'
  },

  401: {
    title: 401,
    message: 'accès non autorisé'
  },

  404: {
    title: 404,
    message: 'ressource introuvable'
  }

}

var fields = {
    namespace: 'nom du calendrier'
  , password: 'mot de passe'
}

module.exports = function(err, data, status){

  err = err || status
  data = data || {}


  var $ = {
      message: 'Unknown Error'
    , code: -1
  }

  if(!err) return $

  if(err.name == 'ValidationError'){
    var e = err.errors[_.keys(err.errors)[0]]

    $.code = 1
    $.type = e.name
    $.slug = e.path
    $.message = 'paramètre "'+e.path+'" manquant'
  }

  if(err.name == 'MongoError'){
    var e = err

    if(/E11000/.test(e.message))
      e.message = '"'+e.message.split('"')[1] + '" existe déjà !'

    $.code = e.code
    $.type = e.name
    $.slug = e.path
    $.message = e.message
  }

  if(!isNaN(err)){
    var e = errors[err] || {
      message: 'code '+err
    }

    $.code = err
    if(data.type) $.type = data.type 
    if(data.slug) $.slug = data.slug 
    if(e.title) $.title = e.title 
    $.message = utils.string.interpolate(e.message, { slug: fields[data.slug] || data.slug })
  }

  return $
}