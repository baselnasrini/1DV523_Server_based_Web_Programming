/**
 * The starting point of the application.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */
'use strict'

const express = require('express')
const hbs = require('express-handlebars')
const { join } = require('path')
const logger = require('morgan')
const session = require('express-session')
const mongoose = require('./configs/mongoose')
var fs = require('fs')
var https = require('https')

const app = express()

// Setup and connect the database
mongoose.connect().catch(error => {
  console.error(error)
  process.exit(1)
})

// View engine setup
app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'default',
  layoutsDir: join(__dirname, 'views/layouts'),
  partialsDir: join(__dirname, 'views', 'partials'),
  helpers: {
    ifEqual: function (v1, v2, options) {
      if (v1 === v2) {
        return options.fn(this)
      }
      return options.inverse(this)
    }
  }
}))
app.set('view engine', 'hbs')
app.set('views', join(__dirname, 'views'))

// Additional middleware
app.use(logger('dev'))
app.use(express.urlencoded({ extended: false }))
app.use(express.static(join(__dirname, 'public')))

// Setup and use session middleware
const sessionOptions = {
  name: 'serverSession',
  secret: require('crypto').randomBytes(16).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}
app.use(session(sessionOptions))

// Https certificates configuration
const httpsServer = https.createServer({
  key: fs.readFileSync('./certificate/key.key'),
  cert: fs.readFileSync('./certificate/certificate.cert')
}, app)

// CORS configuration
app.use((req, res, next) => {
  res.type('.html')
  res.setHeader('Access-Control-Allow-Origin', 'https://localhost')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cookie')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  next()
})

// Config session storage
app.use(function (req, res, next) {
  res.locals.session = req.session
  next()
})

app.use((req, res, next) => {
  if (req.session.flash) {
    res.locals.flash = req.session.flash
    delete req.session.flash
  }
  next()
})

// Routes
app.use('/', require('./routes/homeRouter'))
app.use('/snippets', require('./routes/snippetsRouter'))
app.use('/register', require('./routes/registerRouter'))
app.use('*', (req, res, next) => res.status(404).render('errors/404'))

// Error handling
app.use((err, req, res, next) => {
  // 404 file not found Error.
  if (err.status === 404) {
    res
      .status(404)
      .render('errors/404')
  }

  // 500 Internal Server Error.
  if (req.app.get('env') !== 'development') {
    return res
      .status(500)
      .render('errors/500')
  }

  // Render the error page.
  res
    .status(err.status || 500)
    .render('errors/500', { error: err })
})

// Start listening.
httpsServer.listen(8000, () => {
  console.log('Server started on https://localhost:8000')
  console.log('Press Ctrl-C to terminate...')
})
