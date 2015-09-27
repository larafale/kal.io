
var _ = require('lodash')
  , utils = require('../../lib/utils')
  , config = require('../../lib/config')
  , mailer = require('../../lib/mailer')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Schema.ObjectId
  , Mixed = mongoose.Schema.Types.Mixed
  , moment = require('moment')
  , async = require('async')
  , swig = require('swig')

var schema = new mongoose.Schema({
    user: { type: Number, required: false }, // record
    resource: { type: Number, required: true }, // record
    start: { type: Number, required: true }, // hour base10
    end: { type: Number, required: true }, // hour base10
    duration: { type: Number, required: true }, // hour base10
    sharedWith: { type: Number }, // record
    note: { type: String }, // record
    day: { type: Date }, // record
    color: { type: String, enum: ['green' ,'red' ,'blue' ,'yellow' ,'orange' ,'grey'] }
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
schema.plugin(require('../../lib/autoincr'), { model: 'Block', field: 'record', start: 1 })

// Virtuals

schema.methods.sendEmails = function(options){

  var block = this

  async.map(_.compact([ block.resource, block.sharedWith ]), function(resourceId, cb){
    block.models.Resource.findByRecord(resourceId, function(err, resource){
      cb(null, resource.emails)
    })
  }, function(err, emails){ 
    emails = _.compact(_.uniq(emails || []))
    if(!emails.length) return

    block.preview(function(preview){
      preview = swig.renderFile('./assets/email/reza.html', preview, function(err, html){
        if(err) return
        mailer({ 
            from: '<reza@kal.io>'
          , to: emails
          , html: html
          , subject: 'Réservation' 
        }, function(err, data){
          console.log(err || data)
        })
      })
    })
  })
}

// object preview
schema.methods.preview = function(callback, output){

  moment.locale('fr')

  var block = this
    , preview = {}
          
  async.series([
    function(cb){
      block.models.User.findByRecord(block.user, function(err, user){
        if(user) preview.user = user
        cb()
      })
    },
    function(cb){
      block.models.Resource.fetchFromBlock(block, function(err, resources){
        if(resources.resource) preview.resource = resources.resource
        if(resources.sharedWith) preview.sharedWith = resources.sharedWith
        cb()
      })
    },
    function(cb){
      preview.day = new moment(block.day).add(block.start, 'hour').format('dddd DD MMM')
      preview.start = new moment(block.day).add(block.start, 'hour').format('HH:mm')
      preview.end = new moment(block.day).add(block.start, 'hour').add(block.duration, 'hour').format('HH:mm')
      preview.duration = new moment(block.day).add(block.duration, 'hour').format('HH\\hmm')
      if(block.note) preview.note = block.note
      cb()
    }
  ], function(err){

    if(output == 'html')
      preview = _.reduce(preview, function(out, val, key) {
        out.push([key, val].join(': '))
        return out
      }, []).join('<br/>')

    callback(preview)
  })

}

schema.methods.toJSON = function(){

  var self = this
    , fields = [
          // '_id'
         'record'
        , 'start'
        , 'end'
        , 'duration'
        , 'sharedWith'
        , 'color'
        , 'note'
        , 'user'
        , 'resource'
      ]

  //convert to vanilla object
  self = self.toObject({ virtuals: true })

  //pick JSON fields
  self = _.pick(self, fields)

  return self
}

// Export schema

module.exports = schema

