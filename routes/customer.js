const router = require('express').Router()
const sharp = require('sharp')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

// Cloudinary
cloudinary.config()

// Models
const User = require('../models/User')
const Product = require('../models/Product')

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
