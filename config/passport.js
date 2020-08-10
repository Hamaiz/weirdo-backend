const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const TwitterStrategy = require('passport-twitter').Strategy
const bcrypt = require('bcryptjs')

const User = require('../models/User')

function initialize(passport) {
  const authenticateUser = async (email, password, done) => {
    User.findOne({ email })
      .select('+password')
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: 'This email is not registered',
            param: 'email',
          })
        }
        if (user.confirmed === false) {
          return done(null, false, {
            message: 'Please Verify your account',
            param: 'email',
          })
        }

        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false, {
              message: 'Password incorrect',
              param: 'password',
            })
          }
        })
      })
  }

  passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
  passport.serializeUser((user, done) => done(null, user.id))
  passport.deserializeUser(async (id, done) => {
    // User.findById(id, (err, user) => {
    // done(null, user)
    // })
    const user = await User.findById(id)
    done(null, user)
  })

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: 'http://localhost:5001/api/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        process.nextTick(function () {
          User.findOne(
            {
              $or: [
                { 'google.id': profile.id },
                { email: profile._json.email },
              ],
            },
            (err, user) => {
              if (user) {
                if (user.google.id === undefined) {
                  user.google.id = profile.id
                  user.google.token = accessToken
                  user.google.email = profile._json.email
                  user.google.name = profile._json.name
                  user.save()
                }
                return done(null, user)
              } else {
                let newUser = new User()
                newUser.name = profile._json.name
                newUser.email = profile._json.email
                newUser.confirmed = true
                newUser.promotions = true
                newUser.google.id = profile.id
                newUser.google.token = accessToken
                newUser.google.email = profile._json.email
                newUser.google.name = profile._json.name
                newUser.verificationExpires = undefined
                newUser.save()

                return done(null, newUser)
              }
            }
          )
        })
      }
    )
  )

  passport.use(
    new TwitterStrategy(
      {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
        callbackURL: 'http://localhost:5001/api/twitter/callback',
        userProfileURL:
          'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      },
      async (accessToken, refreshToken, profile, done) => {
        process.nextTick(function () {
          User.findOne(
            {
              $or: [
                { 'twitter.id': profile.id },
                { email: profile._json.email },
              ],
            },
            (err, user) => {
              if (user) {
                if (user.twitter.id === undefined) {
                  user.twitter.id = profile.id
                  user.twitter.token = accessToken
                  user.twitter.email = profile._json.email
                  user.twitter.name = profile._json.name
                  user.save()
                }

                return done(null, user)
              } else {
                let newUser = new User()
                newUser.name = profile._json.name
                newUser.email = profile._json.email
                newUser.confirmed = true
                newUser.promotions = true
                newUser.twitter.id = profile.id
                newUser.twitter.token = accessToken
                newUser.twitter.email = profile._json.email
                newUser.twitter.name = profile._json.name
                newUser.verificationExpires = undefined
                newUser.save()

                return done(null, newUser)
              }
            }
          )
        })
      }
    )
  )
}

module.exports = initialize
