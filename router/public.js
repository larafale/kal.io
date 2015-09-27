var router = module.exports = require('express').Router()
  , app = require('../app')
  , config = require('../lib/config')
  , db = require('../services/db')
  , mw = require('./middlewares')
  , _ = require('lodash')


// omit assets
// router.use(function(req, res, next){
//   var isAsset = /^\/js\//.test(req.url) || /^\/css\//.test(req.url) || /^\/img\//.test(req.url)
//   return isAsset ? res.send(200) : next()
// })

router.all('/signin', mw.session ,function(req, res){
  req.method != 'POST'
    ? res.render('signin')
    : db.User.authenticate(req.body, req.account.record, function(err, user){
        req.session.user = user
        res.redirect(req.session.fromUrl.pathname)
      })
})

router.get('/signout', function(req, res){
  var ns = '/'+req.session.account.namespace
  console.log('signout', ns)
  req.session.destroy(function(){
    res.redirect(ns) // redirect to namespace
  })
})

router.get('/', function(req, res){
  res.render('home', { webUri: config.webUri })
})

router.get('/:id/admin', [mw.session, mw.grant('admin')], function(req, res){
  res.render('admin')
})

router.get('/:id', [mw.initSession, mw.session], function(req, res){
  res.render('kal')
})

router.get('/reset/:account', function(req, res){
  var fixtures = require('../fixtures');

  fixtures(req.params.account, function(err){
    res.json(err || 'ok')
  })
})

router.get('/erase/:account', function(req, res){
  if(req.query.secret != '...') return res.json('tell me a secret ...')
  db.Account.removeAccount(req.params.account, function(err){
    res.json(err || 'erased')
  })
})

// router.get('/robots.txt', function(req, res){ res.end("User-agent: *\nDisallow: /") })