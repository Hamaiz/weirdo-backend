if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

// Requiring Modules
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const sslRedirect = require('heroku-ssl-redirect')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const fileUpload = require('express-fileupload')
const sharedsession = require('express-socket.io-session')
const helmet = require('helmet')
const compression = require('compression')
const cors = require('cors')
const slowDown = require('express-slow-down')
const { notFound, errorHandler } = require('./config/errorHandling')

// Passport
const initializePassport = require('./config/passport')
initializePassport(passport)

// Middlewares
app.use(cors({ origin: process.env.ORIGIN_URL, credentials: true }))
app.use(helmet())
app.use(sslRedirect())
app.use(fileUpload())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(compression())
let sess = {
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.DATABASE_URL,
  }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 21600000,
  },
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1)
  app.enable('trust proxy')
  sess.cookie.secure = true
}
app.use(
  slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: 100,
    delayMs: 500,
  })
)
app.use(session(sess))
app.use(passport.initialize())
app.use(passport.session())

// Routes
app.use('/api', require('./routes/user'))
app.use('/api', require('./routes/customer'))
app.use('/api', require('./routes/seller'))

// Erro Handling
app.use(notFound)
app.use(errorHandler)

// Database
mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
})
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', () => console.log('Connected to mongoose'))

// Listen on port
server.listen(process.env.PORT || 5001, () =>
  console.log('Ready on http://localhost:5001')
)
