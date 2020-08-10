const mongoose = require('mongoose')
const mongooseFieldEncryption = require('mongoose-field-encryption')
  .fieldEncryption

const sellerData = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    location: {
      city: String,
      country: String,
    },
    company: {
      type: String,
    },
    abbreviation: {
      type: String,
    },
    companiesLinkedin: {
      type: String,
    },
    companiesFacebook: {
      type: String,
    },
    owner: {
      type: String,
    },
    age: {
      type: String,
    },
    yourLinkedin: {
      type: String,
    },
    yourFacebook: {
      type: String,
    },
    yourDescription: {
      type: String,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    experience: {
      type: String,
    },
  },
  { timestamps: true }
)

sellerData.plugin(mongooseFieldEncryption, {
  fields: ['phone', 'address'],
  secret: process.env.MONGOOSE,
})

module.exports = mongoose.model('Seller', sellerData)
