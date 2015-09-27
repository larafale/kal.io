"use strict";

var models = require('./services/models')
  , con = require('./services/con')
  , config = require('./lib/config')
  , async = require('async')
  , _ = require('lodash')

// require('mongoose').set('debug', 1)

module.exports = function(account, callback){

    var data = require('./fixtures-data')()[account]

    async.series([

      function(cb){
        if(con._readyState == 1) return cb()
        con.open(config.mongoUri, config.mongoOptions || {}, cb)
      },

      function(cb){
        models.Account.removeAccount(account, cb)
      },

      function(cb){

        // console.log(data)

        var $refs = {}

        // each models
        async.eachSeries(_.keys(data), function(model, cb){

          console.log('')
          console.log('---------------------- ')
          console.log('----- ' +model)
          console.log('---------------------- ')
          console.log('')

          async.eachSeries(data[model], function(object, cb){

            var idx = object.$idx && [model, object.$idx].join(':')
              , ref = object.$ref

            if(idx){
              $refs[idx] = true
              delete object.$idx
            }

            if(ref){
              if(!_.isArray(ref)) ref = [ref]
              _.each(ref, function(r){
                r = r.split(':')
                object[r[3]] = $refs[[r[0],r[1]].join(':')][r[2]]
              })
              delete object.$ref
            }

            // save object
            new models[model](object).save(function(err, obj){
              if(err) throw { name: model +' :', message: err }

              if(idx) $refs[idx] = obj // replace with real object
              console.log(obj)
              cb()
            })


          }, cb)

        }, cb)
      },

      function(cb){

        cb()

        // we don't close because the script run in production
        // and we don't want to close the cone
        // con.close(cb)
      }
      
    ], callback)

}