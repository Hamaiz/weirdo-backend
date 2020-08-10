const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Models
const User = require('../models/User')
const Seller = require('../models/Seller')

// Impots
const { verificationEmail, resetEmail } = require('../config/email')

// USER DETAIL
router.get('/user', async (req, res) => {
  try {
    if (req.header('weirdo-get-user')) {
      if (req.user) {
        const { name, roles, image, location } = req.user
        if (roles === 'user') {
          console.log('Here User')
          res.status(200).json({ name, image, roles, location })
        } else if (roles === 'seller') {
          const seller = await Seller.findOne({ user: req.user.id })
          const {
            owner,
            location,
            company,
            yourDescription,
            companiesLinkedin,
            companiesFacebook,
            yourLinkedin,
            yourFacebook,
            abbreviation,
          } = seller

          res.status(200).json({
            name: owner,
            image,
            roles,
            location: location.city,
            company,
            yourDescription,
            companiesLinkedin,
            companiesFacebook,
            yourLinkedin,
            yourFacebook,
            abbreviation,
          })
        }
      } else {
        res.sendStatus(404)
      }
    } else {
      res.status(404).json({ error: 'Not Found' })
    }
  } catch {
    res.status(404).json({ error: 'Not Found' })
  }
})

// SIGN UP
router.post(
  '/signup',
  [
    check('name', 'Name should not be empty').notEmpty(),
    check('email', 'Please provide a correct email').isEmail(),
    check('password', 'Password be 6 characters long').isLength({ min: 6 }),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passowrd must match')
      } else {
        return true
      }
    }),
  ],
  async (req, res) => {
    const { name, email, password, checkbox } = req.body
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
      } else {
        const user = await User.findOne({ email })

        if (user) {
          res
            .status(422)
            .json({ errors: [{ msg: 'Email alredy exist', param: 'email' }] })
        } else {
          const newUser = await new User({
            name,
            email,
            password,
            promotions: checkbox,
          })
          await bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) {
                throw err
              }
              newUser.password = hash

              newUser.save().then((user) => {
                jwt.sign(
                  {
                    data: user._id,
                  },
                  process.env.EMAIL_SECRET,
                  {
                    expiresIn: '1d',
                  },
                  (err, emailToken) => {
                    // todo - url
                    const checkingHost =
                      req.hostname === 'localhost'
                        ? 'http://localhost:5001'
                        : ''
                    const url = `${checkingHost}/confirmation/${emailToken}`

                    const msg = {
                      to: email,
                      from: `Weirdo <${process.env.GM_EMAIL}>`,
                      subject: 'Confirmation Email',
                      html: verificationEmail(url, name),
                    }
                    sgMail.send(msg).then(
                      () => {
                        res.sendStatus(200)
                      },
                      (error) => {
                        if (error.response) {
                          res.sendStatus(424)
                        }
                      }
                    )
                  }
                )
              })
            })
          })
        }
      }
    } catch (error) {
      res.sendStatus(424)
    }
  }
)

// Confirmation
router.post('/confirmation', async (req, res) => {
  try {
    const { token } = req.body
    const { data } = await jwt.verify(token, process.env.EMAIL_SECRET)
    const user = await User.findById(data)

    if (user.confirmed) {
      res.sendStatus(424)
    } else {
      user.confirmed = await true
      user.verificationExpires = undefined
      await user.save()
      res.sendStatus(200)
    }
  } catch (error) {
    res.sendStatus(424)
  }
})

// Login
router.post('/login', (req, res) => {
  passport.authenticate('local', function (err, user, info) {
    if (info) {
      res.status(401).json(info)
    } else {
      req.logIn(user, function (err) {
        res.status(200).json('done')
      })
    }
  })(req, res)
})

// Logout
router.delete('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      req.logOut()
      res
        .status(200)
        .clearCookie('connect.sid', { path: '/' })
        .json({ status: 'Success' })
    }
  })
})

// Forgot
router.post(
  '/forgot',
  [check('email', 'Please provide a correct email').isEmail()],
  async (req, res) => {
    const { email } = req.body
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
      } else {
        const user = await User.findOne({ email })

        if (!user) {
          res.status(422).json({
            errors: [
              { param: 'no', msg: 'No user associated with this email' },
            ],
          })
        } else {
          user.generatePasswordReset()
          await user.save()

          const url = `http://localhost:5001/reset/${user.resetPasswordToken}`
          const msg = {
            to: email,
            from: `Weirdo <${process.env.GM_EMAIL}>`,
            subject: 'Password Reset Email',
            html: resetEmail(url, user.name),
          }
          sgMail.send(msg).then(
            () => {
              res.sendStatus(200)
            },
            (error) => {
              if (error.response) {
                res.sendStatus(424)
              }
            }
          )
        }
      }
    } catch (error) {
      res.sendStatus(408)
    }
  }
)

// Reset
router.get('/reset/:token', async (req, res) => {
  if (req.header('weirdo-reset-token')) {
    const { token } = req.params
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      })
      if (!user) {
        res.sendStatus(401)
      } else {
        res.sendStatus(200)
      }
    } catch (err) {
      res.sendStatus(408)
    }
  } else {
    res.sendStatus(404)
  }
})

// Recover
router.post(
  '/reset',
  [
    check('password', 'Password be 6 characters long').isLength({ min: 6 }),
    check('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passowrd must match')
      } else {
        return true
      }
    }),
  ],
  async (req, res) => {
    const { password, token } = req.body
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
      } else {
        const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
        })
        if (!user) {
          res.sendStatus(401)
        } else {
          user.password = password
          user.resetPasswordToken = undefined
          user.resetPasswordExpires = undefined

          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
              if (err) res.sendStatus(408)
              user.password = hash
              user.save()

              res.sendStatus(200)
            })
          })
        }
      }
    } catch (error) {
      res.sendStatus(404)
    }
  }
)

// Google
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
)

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: 'http://localhost:5001/accounts/login',
  }),
  (req, res) => {
    res.redirect('http://localhost:4001/dashboard')
  }
)

// Twitter
router.get('/twitter', passport.authenticate('twitter'))

router.get(
  '/twitter/callback',
  passport.authenticate('twitter', {
    failureRedirect: 'http://localhost:5001/accounts/login',
  }),
  function (req, res) {
    res.redirect('http://localhost:5001/')
  }
)

module.exports = router
