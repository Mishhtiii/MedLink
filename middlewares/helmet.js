const helmet = require('helmet')

const helmetMiddleware = helmet({
  contentSecurityPolicy: false, 
  crossOriginResourcePolicy: { policy: "same-origin" }, 
})

module.exports = helmetMiddleware
