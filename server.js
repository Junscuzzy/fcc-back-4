'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongo = require('mongodb').MongoClient
const helmet = require('helmet')

const apiRoutes = require('./routes/api.js')
const fccTestingRoutes = require('./routes/fcctesting.js')
const runner = require('./test-runner')

require('dotenv').config()

const port = process.env.PORT || 3000

const app = express()

app.use('/public', express.static(process.cwd() + '/public'))

app.use(cors({ origin: '*' })) // For FCC testing purposes only

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(helmet())
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'"],
    },
  }),
)

// Index page (static HTML)
app.route('/').get(function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html')
})

const pass = encodeURI(process.env.MONGO_PASS)
const MONGO_URI = `mongodb+srv://zzfcc:${pass}@fcc-mongodb-71tms.mongodb.net/test?retryWrites=true&w=majority`

mongo.connect(MONGO_URI, (err, client) => {
  if (err) {
    console.error('database connection error', err)
    throw err
  } else {
    console.log('Successfull database connection')
  }

  const db = client.db('stock_price')

  // For FCC testing purposes
  fccTestingRoutes(app)

  // Routing for API
  apiRoutes(app, db)

  // 404 Not Found Middleware
  app.use(function (req, res, next) {
    res.status(404).type('text').send('Not Found')
  })

  // Start our server and tests!
  app.listen(port, function () {
    console.log('Listening on port ' + port)
    if (process.env.NODE_ENV === 'test') {
      console.log('Running Tests...')
      setTimeout(function () {
        try {
          runner.run()
        } catch (e) {
          const error = e
          console.log('Tests are not valid:')
          console.log(error)
        }
      }, 3500)
    }
  })
})

module.exports = app // for testing
