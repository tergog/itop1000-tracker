const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000;

const appServer = express();

appServer.use(bodyParser.urlencoded({ extended: true }))
appServer.use(bodyParser.json({ limit: '50mb' }))
appServer.use(cors())


appServer.use('/accounts', require('./accounts/accounts.controller'))

module.exports = appServer;

// appServer.listen(PORT, () => {
//     console.log('Server has been started...')
// })



