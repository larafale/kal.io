var app = require('../app')
  , mw = require('./middlewares')

app.use('/', mw.title)
app.use('/', require('./public'))
app.use('/app', require('./app'))
app.use('/api', require('./api'))