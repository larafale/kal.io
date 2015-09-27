var _ = require('lodash')
  , utils = require('../../lib/utils')
  , config = require('../../lib/config')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId
  , Mixed = mongoose.Schema.Types.Mixed
  , async = require('async')

var schema = new mongoose.Schema({
    login: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    primaryKey: { type: String, required: true, unique: true }, // unique user login by namespace
    namespace: { type: Number, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' }
}, {
    safe: true
  , autoIndex: true
})

// Hooks

schema.pre('validate', function(next){
  if(!this.primaryKey)
    this.primaryKey = '' + this.namespace + this.login

  next()
})

schema.pre('save', function(next){

  next()
})


// Schema Options

schema.set('versionKey', false)
schema.plugin(require('../../lib/autoincr'), { model: 'User', field: 'record', start: 1 })


// Virtuals

schema.statics.removeUser = function(record, callback){
  var self = this

  async.waterfall([

    function(cb){
      self.findOne({ record: record }, cb)
    },

    function(user, cb){
      if(!user) return cb()

      user.models.Block.remove({ user: record }).exec() // remove blocks
      user.remove() // remove user
      cb()
    }

  ], callback)
}

schema.statics.authenticate = function(credentials, namespaceId, callback){
  if(!credentials.login || !credentials.password)
    return callback(true)

  credentials.login = credentials.login.toLowerCase()
  credentials.namespace = namespaceId
  this.findOne(credentials, callback)
}

schema.statics.findByRecord = function(record, callback){
  this.findOne({ record: record }, callback)
}

schema.methods.toJSON = function(){

  var self = this
    , fields = [
          '_id'
        , 'record'
        , 'login'
        , 'name'
        , 'phone'
        , 'namespace'
        , 'role'
      ]

  //convert to vanilla object
  self = self.toObject({ virtuals: true })

  //pick JSON fields
  self = _.pick(self, fields)

  return self
}

// Export schema

module.exports = schema

