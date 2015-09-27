var _ = require('lodash')
  , utils = require('../../lib/utils')
  , config = require('../../lib/config')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId
  , Mixed = mongoose.Schema.Types.Mixed
  , async = require('async')

var schema = new mongoose.Schema({
    namespace: { type: String, required: true, lowercase: true, unique: true },
    config: {
      from: { type: Number, required: true, default: 8 },
      to: { type: Number, required: true, default: 20 },
      step: { type: Number, required: true, default: 1 },
      grid: { type: Number, required: true, default: 0.5 },
      public: { type: Boolean, required: true, default: false }, // if public no need to login
      unzones: [ Mixed ], //  { start: 17, duration: 1 } 
      undays: [ String ] // '0' is sunday (0 must be string)
    }
}, {
    safe: true
  , autoIndex: true
})

// Hooks

schema.pre('save', function(next) {
  next()
})


// Schema Options

schema.set('versionKey', false)
schema.plugin(require('../../lib/autoincr'), { model: 'Account', field: 'record', start: 1 })

// Virtuals

schema.statics.removeAccount = function(namespace, callback){
  var self = this

  async.waterfall([

    function(cb){
      self.findOne({ namespace: namespace }, cb)
    },

    function(account, cb){
      if(!account) return cb()

      account.remove() // remove account
      account.models.User.remove({ namespace: account.record }).exec() // remove users
      account.models.Resource.find({ namespace: account.record }, function(err, resources){
        cb(err, resources, account)
      })
    },

    function(resources, account, cb){
      if(!resources || !resources.length) return cb()

      var resourcesIds = _.map(resources, function(r){ return r.record })

      account.models.Block.remove({ resource: { $in: resourcesIds } }).exec() // remove blocks
      account.models.Resource.remove({ record: { $in: resourcesIds } }).exec() // remove resource

      cb()
    }

  ], callback)
}

schema.methods.toJSON = function(){

  var self = this
    , fields = [
          '_id'
        , 'record'
        , 'namespace'
        , 'withLogin'
        , 'config'
      ]

  //convert to vanilla object
  self = self.toObject({ virtuals: true })

  //pick JSON fields
  self = _.pick(self, fields)

  return self
}

// Export schema

module.exports = schema

