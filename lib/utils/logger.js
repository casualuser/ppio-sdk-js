const { createLogger, format, transports } = require('winston')

const { combine } = format

const console = new transports.Console({
  level: 'debug',
  name: 'console',
  format: format.simple(),
})

const addPrefixFormat = format(info => {
  info.message = `[ppio-sdk] ${info.message}`
  return info
})

const sdkLogger = createLogger({
  level: 'info',
  format: combine(format.json(), addPrefixFormat()),
  transports: [console],
})

module.exports = sdkLogger
