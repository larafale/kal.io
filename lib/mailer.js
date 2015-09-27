var config = require('../lib/config')
  , _ = require('lodash')
  , mailer = require('nodemailer')
  , transport = mailer.createTransport("SMTP", {
      host: 'in.mailjet.com',
      secureConnection: true,
      port: 465,
      requiresAuth: true,
      auth: {
        user: '9c70af34ac2ce4cf81fe211e6d62c1e2', 
        pass: '4336fce32394f0211709020699078b3a' 
      }
    })

module.exports = !config.services.mailer

  ? function(options, callback){ callback() }
  : function(options, callback){ 
      options.from = options.from || 'kal.io <hello@kal.io>' //ϝlooz ✪ ☆ ★
      options.subject = options.subject || 'Kal.io'

      transport.sendMail(options, callback)
    }
