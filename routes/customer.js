const router = require('express').Router()
const sharp = require('sharp')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// Cloudinary
cloudinary.config()

// Models
const User = require('../models/User')
const Product = require('../models/Product')
const Seller = require('../models/Seller')

router.post('/imageUpload', async (req, res) => {
  const { data } = req.files.file
  const { anotherId, id, image, imageId } = req.user

  try {
    const response = await sharp(data)
      .resize({ width: 250 })
      .png({ quality: 85 })
      .toBuffer()

    const user = await User.findById(id)

    if (
      image !== 'https://i.ya-webdesign.com/images/avatar-pic-circle-png-5.png'
    ) {
      cloudinary.uploader.destroy(imageId)
    }

    const result = await uploadFromBuffer(response, anotherId)
    const { public_id, url } = result

    user.image = url
    user.imageId = public_id
    await user.save()

    res.sendStatus(200)
  } catch (error) {
    res.sendStatus(401)
  }
})

router.post('/location', async (req, res) => {
  try {
    const { ipv4 } = req.body
    if (ipv4) {
      const data = await fetch(`http://www.geoplugin.net/json.gp?ip=${ipv4}`)
      const { geoplugin_city } = await data.json()

      // User
      const user = await User.findById(req.user.id)
      user.location = geoplugin_city
      await user.save()
      res.sendStatus(200)
    } else {
      res.sendStatus(422)
    }
  } catch (error) {
    res.sendStatus(404)
  }
})

router.get('/customer/get-product', async (req, res) => {
  if (req.header('weirdo-customer-product')) {
    const product = await Product.find()
      .select('-user')
      .sort('-updatedAt')
      .exec()

    res.status(200).json(product)
  } else {
    res.sendStatus(404)
  }
})

router.get('/get-item/:item', async (req, res, next) => {
  if (req.header('weirdo-item-product')) {
    try {
      const { item } = req.params
      const { page } = req.query
      const skipItems = Number(page) === 1 ? 0 : (page - 1) * 50

      // Count
      const count = await Product.find().countDocuments()

      // Get Product
      const product = await Product.find()
        .regex('keywords', new RegExp(item, 'i'))
        .select('-user')
        .sort('-updatedAt')
        .skip(skipItems)
        .limit(50)
        .exec()

      const response = {
        totalPages: Math.ceil(count / 50),
        page: page ? Number(page) : 1,
        items: product,
      }

      res.status(200).json(response)
    } catch (error) {
      res.sendStatus(404)
    }
  } else {
    const error = new Error('Unauthorized')
    res.status(404)
    next(error)
  }
})

router.get('/get-single-item/:slug', async (req, res, next) => {
  if (req.header('weirdo-item-specific-product')) {
    try {
      const { slug } = req.params

      // Get Product
      const product = await Product.findOne({ slug })
      const seller = await Seller.findOne({ user: product.user })
        .select('-phone')
        .select('-address')
        .select('-__enc_phone')
        .select('-__enc_address')

      const response = {
        product,
        seller,
      }

      res.status(200).json(response)
    } catch (error) {
      res.sendStatus(404)
    }
  } else {
    const error = new Error('Unauthorized')
    res.status(404)
    next(error)
  }
})

router.get('/get-latest-item', async (req, res, next) => {
  if (req.header('weirdo-item-product')) {
    try {
      // Get Product
      const product = await Product.find().limit(9).sort('-createdAt')

      res.status(200).json(product)
    } catch (error) {
      res.sendStatus(404)
    }
  } else {
    const error = new Error('Unauthorized')
    res.status(404)
    next(error)
  }
})

// Upload Buffer
const uploadFromBuffer = (response, anotherId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `weirdo/${anotherId}`,
      },
      (error, result) => {
        if (result) {
          resolve(result)
        } else {
          reject(error)
        }
      }
    )
    streamifier.createReadStream(response).pipe(uploadStream)
  })
}

module.exports = router
