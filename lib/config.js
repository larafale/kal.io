var _ = require('lodash')

var config = module.exports = {
  set: function(options) {
    config = _.extend(config, options)
    return config
  }
}

if(process.env.NODE_ENV == 'production'){
  config.port      = process.env.PORT
  config.host      = 'kalio.herokuapp.com'
  config.url       = 'http://' + config.host
  config.env       = 'production'
  config.webUri    = 'www.kal.io'
  config.apiUri    = ''
  config.socketUri = ''
  config.mongoUri  = 'mongodb://kalio:2f4s3Qvp@kahana.mongohq.com:10052/kalio'
  config.store     = 'mongodb://kalio:2f4s3Qvp@kahana.mongohq.com:10052/kalio'
  config.debug     = { server: true }
  config.services  = { mailer: true }
}else if(process.env.NODE_ENV == 'staging'){
  config.port      = process.env.PORT
  config.host      = 'kalio.herokuapp.com'
  config.url       = 'https://' + config.host
  config.env       = 'staging'
  config.webUri    = ''
  config.apiUri    = ''
  config.mongoUri  = ''
  config.store     = ''
  config.debug     = { server: true }
  config.services  = { mailer: false }
}else{
  config.port      = 3009
  config.host      = 'localhost'
  config.url       = 'http://' + config.host
  config.env       = 'dev'
  config.webUri    = 'localhost:3009'
  config.apiUri    = ''
  config.socketUri = ''
  config.mongoUri  = 'mongodb://localhost:27017/kalio'
  config.store     = 'mongodb://localhost:27017/kalio'
  config.debug     = { server: true }
  config.services  = { mailer: false }
}



    