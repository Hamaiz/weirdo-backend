const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
    },
    slug: {
      type: String,
    },
    folderName: {
      type: String,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
    },
    sale: {
      type: Number,
    },
    dimensions: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    keywords: [],
    image: {
      type: String,
      default:
        'https://s3-ap-southeast-1.amazonaws.com/upcode/static/default-image.jpg',
    },
    imageId: {
      type: String,
    },
    gallery: [
      String,
      // {
      // image: String,
      // imageId: String,
      // },
    ],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Product', productSchema)
