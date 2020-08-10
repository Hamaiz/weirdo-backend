const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const crypto = require('crypto')
const sharp = require('sharp')
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const keyword_extractor = require('keyword-extractor')

// Model
const Seller = require('../models/Seller')
const User = require('../models/User')
const Product = require('../models/Product')
const Client = require('../models/Client')

// Cloudinary Config
cloudinary.config()

router.post(
  '/seller/start',
  [
    check('companyName').notEmpty(),
    check('companyAbbr').notEmpty(),
    check('yourName').notEmpty(),
    check('yourAge').isNumeric(),
    check('yourDescripiton').notEmpty(),
    check('personalNumber').isMobilePhone(),
    check('personalExp').isNumeric(),
    check('personalAddress').notEmpty(),
  ],
  async (req, res) => {
    const {
      companyName,
      companyAbbr,
      comapnyLinkedin,
      companyFacebook,
      yourName,
      yourAge,
      yourLinkedin,
      yourFacebook,
      yourDescripiton,
      personalNumber,
      personalExp,
      personalAddress,
      ipv4,
    } = req.body
    try {
      if (req.user.roles === 'user') {
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
          res.status(422).json({ errors: errors.array() })
        } else {
          const data = await fetch(
            `http://www.geoplugin.net/json.gp?ip=${ipv4}`
          )
          const { geoplugin_city, geoplugin_countryName } = await data.json()

          const seller = new Seller()
          seller.user = req.user.id
          seller.location.city = geoplugin_city
          seller.location.country = geoplugin_countryName
          seller.company = companyName
          seller.abbreviation = companyAbbr
          seller.companiesLinkedin = comapnyLinkedin
          seller.companiesFacebook = companyFacebook
          seller.owner = yourName
          seller.age = yourAge
          seller.yourLinkedin = yourLinkedin
          seller.yourFacebook = yourFacebook
          seller.yourDescription = yourDescripiton
          seller.phone = personalNumber
          seller.address = personalAddress
          seller.experience = personalExp
          await seller.save()

          const user = await User.findById(req.user.id)
          user.roles = 'seller'

          await user.save()
          res.sendStatus(200)
        }
      } else {
        res.sendStatus(400)
      }
    } catch (error) {
      res.sendStatus(424)
    }
  }
)

router.post(
  '/seller/add-product',
  [
    check('title').notEmpty(),
    check('price').isNumeric(),
    check('weight').isNumeric(),
    check('dimensions').notEmpty(),
    check('available').isBoolean(),
    check('description').isLength({ min: 50 }),
  ],
  async (req, res) => {
    const {
      title,
      price,
      dimensions,
      available,
      weight,
      description,
    } = req.body
    const { anotherId, id } = req.user

    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
      } else {
        // New Product
        const product = await new Product()

        // Slug
        const slugEnd = await crypto.randomBytes(6).toString('hex')
        const slug =
          title
            .trim()
            .replace(/[^\w\d ]/g, '')
            .replace(/\s+/g, '-')
            .toLowerCase() + `-${slugEnd}`
        product.slug = slug

        // Save Data
        product.user = id
        product.title = title
        product.price = price
        product.dimensions = dimensions
        product.available = available
        product.weight = weight
        product.description = description

        const descriptionEdit = description
          .replace(/[^\w\d ]/g, '')
          .toLowerCase()
        // Keywords
        const descKeywords = keyword_extractor.extract(descriptionEdit, {
          language: 'english',
          remove_digits: true,
          return_changed_case: true,
          remove_duplicates: true,
        })
        const titleKeywords = keyword_extractor.extract(title, {
          language: 'english',
          remove_digits: true,
          return_changed_case: true,
          remove_duplicates: true,
        })
        const mergeArray = descKeywords.concat(titleKeywords)
        const filteredArray = mergeArray.filter((item, pos) => {
          return mergeArray.indexOf(item) === pos
        })
        product.keywords = filteredArray

        // Images
        const folderName = await crypto.randomBytes(8).toString('hex')
        product.folderName = folderName

        if (req.files) {
          // Main Image
          if (req.files.file) {
            const randomPicName = await crypto.randomBytes(6).toString('hex')
            const compressedImg = await sharp(req.files.file.data)
              .png({ quality: 85 })
              .toBuffer()
            await dbx.filesUpload({
              path: `/${anotherId}/${folderName}/${randomPicName}.png`,
              contents: compressedImg,
            })
            const { url } = await dbx.sharingCreateSharedLink({
              path: `/${anotherId}/${folderName}/${randomPicName}.png`,
            })
            const correctUrl = await url
              .replace(/w{3}.dropbox/g, 'dl.dropboxusercontent')
              .replace(/[?]dl=0/g, '')

            product.image = correctUrl
          }
          // Gallery
          if (req.files.productPhotos) {
            for await (const photo of req.files.productPhotos) {
              const randomPicName = crypto.randomBytes(6).toString('hex')
              const compressedImg = await sharp(photo.data)
                .png({ quality: 85 })
                .toBuffer()

              await dbx.filesUpload({
                path: `/${anotherId}/${folderName}/gallery/${randomPicName}.png`,
                contents: compressedImg,
              })
              const { url } = await dbx.sharingCreateSharedLink({
                path: `/${anotherId}/${folderName}/gallery/${randomPicName}.png`,
              })

              const correctUrl = await url
                .replace(/w{3}.dropbox/g, 'dl.dropboxusercontent')
                .replace(/[?]dl=0/g, '')

              product.gallery.push(correctUrl)
            }
          }
        }
        // Save
        await product.save()

        res.sendStatus(200)
      }
    } catch (error) {
      res.sendStatus(404)
    }
  }
)

router.post(
  '/seller/edit-product',
  [
    check('title').notEmpty(),
    check('price').isNumeric(),
    check('weight').isNumeric(),
    check('dimensions').notEmpty(),
    check('available').isBoolean(),
    check('description').isLength({ min: 50 }),
  ],
  async (req, res) => {
    const {
      title,
      price,
      dimensions,
      available,
      weight,
      description,
      slug,
    } = req.body
    const { anotherId, id } = req.user

    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(422).json({ errors: errors.array() })
      } else {
        // New Product
        const product = await Product.findOne({ slug })

        if (!product) {
          res.sendStatus(422)
        } else {
          // Save Data
          product.title = title
          product.price = price
          product.dimensions = dimensions
          product.available = available
          product.weight = weight
          product.description = description

          const descriptionEdit = description
            .replace(/[^\w\d ]/g, '')
            .toLowerCase()
          // Keywords
          const descKeywords = keyword_extractor.extract(descriptionEdit, {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true,
          })
          const titleKeywords = keyword_extractor.extract(title, {
            language: 'english',
            remove_digits: true,
            return_changed_case: true,
            remove_duplicates: true,
          })
          const mergeArray = descKeywords.concat(titleKeywords)
          const filteredArray = mergeArray.filter((item, pos) => {
            return mergeArray.indexOf(item) === pos
          })
          product.keywords = filteredArray

          // Images
          const { folderName } = product

          if (req.files) {
            // Main Image
            if (req.files.file) {
              const compressedImg = await sharp(req.files.file.data)
                .png({ quality: 85 })
                .toBuffer()

              const result = await uploadFromBuffer(
                compressedImg,
                anotherId,
                folderName
              )
              const { public_id, url } = result

              product.image = url
              product.imageId = public_id
            }
            // Gallery
            if (req.files.productPhotos) {
              for await (const photo of req.files.productPhotos) {
                const compressedImg = await sharp(photo.data)
                  .png({ quality: 85 })
                  .toBuffer()

                const result = await uploadFromBufferGallery(
                  compressedImg,
                  anotherId,
                  folderName
                )
                const { public_id, url } = result

                product.gallery.push({ image: url, imageId: public_id })
              }
            }
          }
          // Save
          await product.save()

          res.sendStatus(200)
        }
      }
    } catch (error) {
      res.sendStatus(404)
    }
  }
)

router.get('/seller/get-product', async (req, res) => {
  if (req.header('weirdo-seller-product')) {
    const product = await Product.find({ user: req.user.id })
      .select('-user')
      .sort('-updatedAt')
      .exec()

    res.status(200).json(product)
  } else {
    res.sendStatus(404)
  }
})

// todo
// router.post('/seller/add-client', async (req, res) => {
//   try {
//     const {} = req.body
//       const product = await Client.find({ user: req.user.id })
//         .select('-user')
//         .sort('-updatedAt')
//         .exec()

//   } catch {}
// })

//* Dont Delete
// const client = await Client.findOne({
//   seller: { $exists: true },
//   customer: { $exists: true },
// })

router.get('/message', async (req, res) => {
  try {
    if (req.header('weirdo-get-message')) {
      const client = await Client.find({ seller: req.user.id })
      if (client) {
        res.status(200).send(client)
      } else {
        res.sendStatus(422)
      }
    } else {
      res.sendStatus(404)
    }
  } catch (error) {
    res.sendStatus(404)
  }
})

// Upload Buffer
const uploadFromBuffer = (response, anotherId, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `weirdo/${anotherId}/${folderName}`,
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

// Gallery
const uploadFromBufferGallery = (response, anotherId, folderName) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `weirdo/${anotherId}/${folderName}/gallery`,
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
