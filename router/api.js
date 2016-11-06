  var router = module.exports = require('express').Router()
  , db = require('../services/db')
  , mw = require('./middlewares')
  , _ = require('lodash')
  , moment = require('moment')
  , async = require('async')
  , mailer = require('../lib/mailer')
  , utils = require('../lib/utils')
  , popup = require('../lib/popup')



var specs = function(specs){
  return function(req, res, next){
    return req.validate(specs)
      ? next()
      : res.respond(1, 400, { 
            slug: req.validate().field
          , type: req.validate().type 
        })
  }
}



router.post('/signup', specs({
    'namespace'   : { required: true }
  , 'email'       : { required: true }
  , 'password'    : { required: true }
}), function(req, res){

  var account = _.pick(req.body, 'namespace')
    , user = _.pick(req.body, 'email', 'password')

  user.role = 'admin'
  user.name = 'admin'
  user.login = req.val('email')

  console.log(req.body)

  // return res.respond(500)

  new db.Account(account).save(function(err, account){
    if(err) return res.respond(err, 400, 'db')

    user.namespace = account.record

    new db.User(user).save(function(err, user){
      if(err) return res.respond(err, 400, 'db')

      mailer({ 
          from: '<reza@kal.io>'
        , to: 'louis.grellet@gmail.com'
        , html: JSON.stringify(req.body)
        , subject: 'Signup : ' + account.namespace 
      }, function(err, data){
        console.log(err || data)
      })

      res.respond({ 
        namespace: account.namespace 
      }, 200)
    })

  })
})


/***

    ACCOUNTS

***/

router.get('/accounts/:id', mw.session, function(req, res){
  db.Account
    .findOne({ namespace: req.account.namespace })
    .exec(function(err, account){
      res.respond(err || account, err ? 400 : 200)
    })
})

router.put('/accounts/:id', mw.session, function(req, res){
  var accountData = _.pick(req.body || {}, 'config')

  db.Account.findById(req.params.id, function(err, account){
    account.set(accountData)
    account.save(function(err, account){
      res.respond(err || account, err ? 400 : 200, popup('Paramètres', 'Enregistrés'))
    })
  })
})

router.post('/accounts', function(req, res){
  var account = req.body || {}

  new db.Account(account)
    .save(function(err, account){
      res.respond(err || account, err ? 400 : 200)
    })
})



/***

    ADMIN

***/


router.post('/admin', function(req, res){
  if(req.query.secret != 'kalio')
    return res.send('secret access')

  var user = req.body || {}

  new db.User(user)
    .save(function(err, user){
      res.respond(err || user, err ? 400 : 200)
    })
})



/***

    USERS

***/

router.get('/users', mw.session, function(req, res){
  db.User
    .find({ namespace: req.account.record })
    .sort({ role: 1 })
    .exec(function(err, users){
      res.respond(err || users, err ? 400 : 200)
    })
})

router.post('/users', mw.session, function(req, res){
  var user = req.body || {}
  user.namespace = req.account.record

  new db.User(user)
    .save(function(err, user){
      res.respond(err || user, err ? 400 : 200, popup('Utilisateur', 'Ajouté'))
    })
})

router.put('/users/:id', mw.session, function(req, res){
  var userData = _.pick(req.body || {}, 'login', 'password', 'name', 'phone')

  db.User.findById(req.params.id, function(err, user){
    user.set(userData)
    user.save(function(err, user){
      res.respond(err || user, err ? 400 : 200, popup('Utilisateur', 'Enregistré'))
    })
  })
})

router.delete('/users/:id', mw.session, function(req, res){
  db.User.removeUser(req.params.id, function(err){
    res.respond(err, err ? 400 : 200, popup('Utilisateur', 'Suprimé'))
  })
})



/***

    RESSOURCES

***/


router.get('/resources', mw.session, function(req, res){
  db.Resource
    .find({ namespace: req.account.record })
    .sort({ pos: 1 })
    .exec(function(err, resources){
      res.respond(err || resources, err ? 400 : 200)
    })
})

router.post('/resources', mw.session, function(req, res){
  var resource = req.body || {}
  resource.namespace = req.account.record

  db.Resource.count({ namespace: resource.namespace }, function(err, count){
    resource.pos = count
    new db.Resource(resource)
      .save(function(err, resource){
        res.respond(err || resource, err ? 400 : 200, popup('Ressource', 'Ajoutée'))
      })
  })
})

router.post('/resources/sort', mw.session, function(req, res){
  var sorted = req.body || false

  async.each(_.keys(sorted), function(id, cb){
    db.Resource.update({ _id: id }, { pos: sorted[id] }).exec(cb)
  }, function(err){
    db.Resource
    .find({ namespace: req.account.record })
    .sort({ pos: 1 })
    .exec(function(err, resources){
      res.respond(err || resources, err ? 400 : 200)
    })
  })
})

router.put('/resources/:id', mw.session, function(req, res){
  var resourceData = _.pick(req.body || {}, 'title', 'grid', 'color', 'show', 'shareable', 'selectable', 'emails')

  db.Resource.findById(req.params.id, function(err, resource){
    resource.set(resourceData)
    resource.save(function(err, resource){
      res.respond(err || resource, err ? 400 : 200, popup('Ressource', 'Enregistrée'))
    })
  })
})

router.delete('/resources/:id', mw.session, function(req, res){
  db.Resource.removeResource(req.params.id, function(err){
    res.respond(err, err ? 400 : 200, popup('Resource', 'Suprimée'))
  })
})


/***

    BLOCS

***/

router.get('/blocks/:date', mw.session, function(req, res){

  var date = new moment(req.params.date, 'DDMMYY')
    , start = new moment(date).startOf('day').toDate()
    , end = new moment(date).endOf('day').toDate()

  db.Resource
    .find({ namespace: req.account.record })
    .sort({ pos: 1 })
    .exec(function(err, resources){

      if(err)
        return res.respond(err, 400)

      // vanilla
      resources = _.map(resources, function(r){ return r.toJSON() })

      async.each(resources, function(r, cb){
        db.Block
          .find({ resource: r.record, day: { "$gte": start, "$lte": end } })
          .exec(function(err, blocks){
            r.data = blocks
            cb()
          })
      }, function(err){
        res.respond(resources, 200)
      })

      // {
      //   id: 5,
      //   title: 'S. Marie',
      //   shareable: true,
      //   selectable: false,
      //   hideIfNoData: false,
      //   color: 'orange',
      //   data: [ ]
      // }

      // console.log(resources)

    })
})

router.post('/blocks', mw.session, function(req, res){
  var block = req.body || {}

  block.sharedWith = block.sharedWith ? parseInt(block.sharedWith, 10) : undefined
  block.user = req.user ? req.isAdmin ? block.user : req.user.record : 0 // what to do when no logged user
  block.day = new moment(block.day, 'DDMMYY').startOf('day').toDate()

  new db.Block(block)
    .save(function(err, block){
      res.respond(err || block, err ? 400 : 200, popup('Réservation', 'Enregistrée'))
      block.sendEmails()
    })
})

router.put('/blocks/:record', mw.session, mw.grant('user'), function(req, res){

  db.Block
    .findOne({ record: req.params.record })
    .exec(function(err, block){

      block.user = req.body.user
      block.note = req.body.note
      block.sharedWith = req.body.sharedWith

      block.save(function(err, block){
        res.respond(err || block, err ? 400 : 200, popup('Réservation', 'Modifiée'))
        block.sendEmails()
      })

    })
})

router.delete('/blocks/:record', mw.session, function(req, res){
  db.Block
    .remove({ record: req.params.record })
    .exec(function(err, affected){
      res.respond(err, err ? 400 : 200, popup('Réservation', 'Supprimée'))
    })
})





