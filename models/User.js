const mongoose = require('mongoose')
const crypto = require('crypto')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    roles: {
      type: String,
      lowercase: true,
      trim: true,
      enum: ['user', 'seller', 'admin'],
      default: 'user',
    },
    confirmed: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: String,
      required: false,
    },
    verificationExpires: {
      type: Date,
      default: () => new Date(+new Date() + 24 * 60 * 60 * 1000),
    },
    image: {
      type: String,
      default: 'https://i.ya-webdesign.com/images/avatar-pic-circle-png-5.png',
    },
    imageId: {
      type: String,
    },
    promotions: {
      type: Boolean,
      default: true,
    },
    location: {
      type: String,
      default: 'Unknown',
    },
    anotherId: {
      type: String,
      default: () => crypto.randomBytes(24).toString('hex'),
    },
    country: {
      type: String,
    },
    google: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
    twitter: {
      id: String,
      token: String,
      email: String,
      name: String,
    },
  },
  { timestamps: true }
)

userSchema.index(
  { verificationExpires: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { confirmed: false },
  }
)

userSchema.methods.generatePasswordReset = function () {
  this.resetPasswordToken = crypto.randomBytes(32).toString('hex')
  this.resetPasswordExpires = Date.now() + 3600000
}

module.exports = mongoose.model('User', userSchema)
