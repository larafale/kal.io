var express = require('express')
  , app = module.exports = express()
  , config = require('./lib/config')
  , http = require('http')
  , server = http.Server(app)
  , logger = require('./lib/logger')
  , serve = require('serve-static')
  , session = require('express-session')
  , store = require('connect-mongo')({ session: session })
  , favicon = require('serve-favicon')

// Shared DB connection
module.exports.con = require('./services/con')

module.exports.init = function(options, callback){

  // check params
  callback = callback || function(){}

  if(typeof options == 'function'){
    callback = options
    options = {}
  }

  // return if inited
  if(app.get('inited'))
    return callback()
  
  app.set('inited', true)

  // view engine
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')

  // static assets
  app.use(serve('./assets'))
  app.use(favicon(__dirname + '/assets/img/clock.ico'))

  // body parser, cookie & sessions
  app.use(require('body-parser')())
  app.use(require('cookie-parser')())
  app.use(session({ 
    secret: 'my[fucking]Se<ret', 
    key: 'kalio.sid', 
    cookie: { maxAge: (60000 * 60) * 5 }, //60minutes
    store: new store({ url: config.store })
  }))

  // router
  require('./lib/response')
  require('./router')
  app.use(function(err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Server is down, retry in 5 minutes !')
  })

  // top level errors
  // app.use(function(err, req, res, next) {
  //   res.render('500')
  // })

  // open DB connection    
  require('mongoose').set('debug', 1) 
  module.exports.con.open(config.mongoUri, config.mongoOptions || {}, 
    function(err){ 
      err ?
        logger('database', 'master error : '+err) 
      : logger('database', 'master strapped on '+config.mongoUri) 
      callback(err)
    })
  
  // end inition
  logger('app', 'inited')
  callback()

}

module.exports.start = function(){

  server.listen(config.port, function(){
    logger('server', 'lifted on port '+config.port)
  })

}