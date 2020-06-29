/**
 * The starting point of the application.
 *
 * @author Mohammed Basel Nasrini
 * @version 1.0.0
 */
'use strict'

const express = require('express')
const hbs = require('express-handlebars')
var bodyParser = require('body-parser')
const app = express()
const path = require('path')
const http = require('http')
const port = process.env.PORT || 3000
const controller = require('./controllers/homeController')
const server = http.createServer(app)

const io = require('socket.io')(server)

// View engine
app.engine('.hbs', hbs({
  defaultLayout: 'default',
  extname: '.hbs'
}))
app.set('view engine', '.hbs')

// Additional middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, '/public')))
app.use(bodyParser.json()) // to support JSON-encoded bodies

io.on('connection', socket => {
  console.log('A new user connect')

  socket.on('closeIssue', (data) => {
    controller.closeIssue(data)
  })

  socket.on('disconnect', () => {
    console.log('a user disconnect')
  })
})

app.use(function (req, res, next) {
  req.io = io
  next()
})

// Routes
app.use('/', require('./routes/homeRouter'))
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

server.listen(port, function () {
  console.log('Express started on https://localhost:' + port)
  console.log('Press Ctrl-C to terminate...')
})
