var _ = require('lodash')
var con = require('../con')

var models = module.exports = {
  'Account': con.model('Account',  require('./account')),
  'User': con.model('User',  require('./user')),
  'Resource': con.model('Resource',  require('./resource')),
  'Block': con.model('Block',  require('./block'))
}

_.each(_.keys(models), function(key){  
  models[key].prototype.models = models
})