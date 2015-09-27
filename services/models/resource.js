
var _ = require('lodash')
  , utils = require('../../lib/utils')
  , config = require('../../lib/config')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId
  , Mixed = mongoose.Schema.Types.Mixed
  , async = require('async')

var schema = new mongoose.Schema({
    title: { type: String, required: true },
    namespace: { type: Number, required: true },
    emails: { type: String, required: false, lowercase: true },
    pos: { type: Number },
    grid: { type: Number },
    show: { type: Boolean, required: true, default: true },
    shareable: { type: Boolean, required: true, default: false },
    selectable: { type: Boolean, required: true, default: false },
    color: { type: String, enum: ['green' ,'red' ,'blue' ,'yellow' ,'orange' ,'grey', 'purple'], default: 'blue' }
}, {
    safe: true
  , autoIndex: true
})

// Hooks

schema.pre('validate', function(next){
  next()
})

schema.pre('save', function(next){
  next()
})


// Schema Options

schema.set('versionKey', false)
schema.plugin(require('../../lib/autoincr'), { model: 'Resource', field: 'record', start: 1 })


// Virtuals

schema.statics.removeResource = function(record, callback){
  var self = this

  async.waterfall([

    function(cb){
      self.findOne({ record: record }, cb)
    },

    function(resource, cb){
      if(!resource) return cb()

      resource.models.Block.update({ sharedWith: record }, { $unset: { sharedWith: true } }, { multi: true }).exec() // update blocks where resource is shared
      resource.models.Block.remove({ resource: record }).exec() // remove blocks
      resource.remove() // remove resource
      cb()
    }

  ], callback)
}

schema.statics.findByRecord = function(record, callback){
  this.findOne({ record: record }, callback)
}

schema.statics.fetchFromBlock = function(block, callback){
  var self = this
    , resources = {}

  async.map(['resource', 'sharedWith'], function(field, cb){
    if(!block[field]) return cb()

    self.findOne({ record: block[field] }, function(err, resource){
      if(resource) resources[field] = resource
      cb()
    })
  }, function(err){
    callback(err, resources)
  })
}

schema.methods.toJSON = function(){

  var self = this
    , fields = [
          '_id'
        , 'record'
        , 'title'
        , 'grid'
        , 'show'
        , 'color'
        , 'emails'
        , 'shareable'
        , 'selectable'
      ]

  //convert to vanilla object
  self = self.toObject({ virtuals: true })

  //pick JSON fields
  self = _.pick(self, fields)

  return self
}

// Export schema

module.exports = schema

