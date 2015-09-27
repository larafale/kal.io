var router = module.exports = require('express').Router()
  , app = require('../app')
  , mw = require('./middlewares')
  , db = require('../services/db')
  , _ = require('lodash')


router.use(mw.session)


router.get('/', function(req, res){
  res.redirect('/app/dashboard')
})

router.get('/dashboard', function(req, res){
  res.render('app/dashboard')
})