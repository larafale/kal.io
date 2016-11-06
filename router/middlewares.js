var app = require('../app')
  , db = require('../services/db')
  , utils = require('../lib/utils')
  , url = require('url')

module.exports = {

  initSession: function(req, res, next){
    
    var fromUrl = url.parse(req.url)
    var namespace = fromUrl.pathname.replace(/\//g,'')
    req.session.fromUrl = fromUrl

    console.log(fromUrl, namespace)

    if(!namespace)
      return res.redirect('/')

    db.Account
      .findOne({ namespace: namespace })
      .exec(function(err, account){

        if(err || !account) 
          return res.redirect('/')

        req.session.account = account

        if(req.session.user && (req.session.account.record != req.session.user.namespace))
          return res.redirect('/signout')

        if(account.config.public){ // no need to login
          next()
        }else{
          req.session.user
            ? next()
            : res.redirect('/signin'+(fromUrl.search||''))
        }
      })
  },

  session: function(req, res, next){

    req.account = req.session.account

    if(!req.account)
      return res.respond(401)

    if(req.session.user){
      req.user = req.session.user
      req.role = req.session.user.role
      req['is'+utils.string.capitalize(req.user.role)] = true // isAdmin in req
      res.locals['is'+utils.string.capitalize(req.user.role)] = true // isAdmin in template
      res.locals.isLogged = true
    }

    res.locals.session = req.session // session in templates
    res.locals.isLogged = req.user ? true : false
    res.locals.title = req.account.namespace + ' » kal.io '

    req.account.config.public
      ? next()
      : req.session.user ? next() : next()
      // : req.session.user ? next() : res.respond(401)

  },

  grant: function(role){
    if(role == 'user')
      return function(req, res, next){
        return req.role == 'admin' || req.user.record == req.body.user
          ? next()
          : res.respond(401)
      }

    return function(req, res, next){
      return req.role !== role
        ? res.respond(401)
        : next()
    }
  },

  title: function(req, res, next){
    res.locals.title = '-- kal . io --'
    next()
  }

}