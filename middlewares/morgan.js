const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const logStream = fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })
const morganLogger = morgan('combined', { stream: logStream })
const devLogger = morgan('dev')
module.exports = { morganLogger, devLogger }
