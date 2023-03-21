// Imports
require('dotenv').config()
const axios = require('axios')

const config = require('config')
const express = require('express')
const app = express()
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const uuid = require('uuid')
const generateId = () => {
  return uuid.v4()
}
const logger = require('./utils/log.js')
const emoji = require('node-emoji')
const cors_list = require('./config/cors_list.js')
const clc = require('cli-color')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false) // or true, depending on your preference

// Init HTTP & Socket servers
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: cors_list,
    methods: [
      'GET',
      'POST',
      'PUT',
      'DELETE',
      'OPTIONS',
      'PATCH',
      'HEAD',
      'CONNECT',
      'TRACE',
    ],
  },
})

// Express Middleware Initialization
app.use(cors({ origin: cors_list }))

// Serve Static Files
app.use(express.static('public'))
app.use('/', express.static('public'))

// Log RAM Usage and User Count
let i = 0
setInterval(() => {
  i++
  const used = process.memoryUsage().heapUsed / 1024 / 1024
  const usedFormatted = used.toFixed(2)
  console.log(
    `RAM Usage after ${i} minutes : ${usedFormatted} MB`
  )
}, 60000)

// Start Server
server.listen(process.env.PORT, () => {
  logger(clc.bgGreen.white(`🚀 LOL started`))
})
