
var mongoose = require('mongoose')
  , con = require('../services/con')
  , Counter
  , CounterSchema

CounterSchema   = new mongoose.Schema({
  m: { type: String, require: true },
  f: { type: String, require: true },
  c: { type: Number, default: 0 }
})

CounterSchema.set('versionKey', false)
Counter = con.model('Counter', CounterSchema)

module.exports = function (schema, options) {

  options = options || {}

  if(!options.model) throw new Error('no model specified')
  options.field = options.field || 'counter'
  options.start = options.start || 0

  // Counter.findOne({ m: options.model.toLowerCase(), f: options.field })
  // .exec(function(err, counter){
  //   if(!err && !counter) (new Counter({ m: options.model.toLowerCase(), f: options.field, c: options.start - 1 })).save()
  // })


  schema.add({ record: Number })

  schema.pre('save', function (next) {
    if(!this.isNew) return next()

    var self = this

    Counter.findOneAndUpdate(
      { m: options.model.toLowerCase(), f: options.field }, 
      { $inc: { c: 1 } },
      { upsert: true },
      function(err, counter){
        if(!err) self.record = counter.c
        next()
      }) 
  })
  
}

