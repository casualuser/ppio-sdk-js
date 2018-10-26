const portScanner = require('portscanner')
const logger = require('./logger')

module.exports = () => {
  logger.info('getting port')
  let netport, rpcport
  return portScanner
    .findAPortNotInUse(18000, 20000)
    .then(port => {
      logger.info(`rpc port found: ${port}`)
      rpcport = port
      return portScanner.findAPortNotInUse(8060, 9000)
    })
    .then(port => {
      logger.info(`net port found: ${port}`)
      netport = port
      return { netport, rpcport }
    })
    .catch(err => {
      logger.error(new Error('cannot find port'))
      return Promise.reject(err)
    })
}
