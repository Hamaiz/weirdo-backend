const User = require('../models/User')
const { loadEnvConfig } = require('next/dist/lib/load-env-config')

module.exports = function (io, sharedsession, session, sess) {
  // Middleware
  io.of('/chat').use(
    sharedsession(session(sess), {
      autoSave: true,
    })
  )

  // SocketIo
  const nsp = io.of('/chat')
  nsp.on('connection', async (socket) => {
    console.log('Done')

    const id = await socket.handshake.session.passport.user
    const user = await User.findById(id)
    console.log(id)

    if (user) {
      socket.join('/chat#aTWbrYBo1lzFlTDxAAAC')
    }

    socket.on('sendMessage', async ({ message, name }, callback) => {
      console.log(message, name)

      const trimmedName = name.trim().toLowerCase().split(' ')[0]
      nsp
        .to('/chat#aTWbrYBo1lzFlTDxAAAC')
        .emit('message', { user: trimmedName, text: message })
      callback()
    })
  })
}
