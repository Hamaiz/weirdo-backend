const mongoose = require('mongoose')

const messageSchema = mongoose.Schema(
  {
    message: {
      type: String,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
)

// module.exports = mongoose.model('User', userSchema)
