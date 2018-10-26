const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const {
  DEFAULT_BOOTSTRAP_IPS,
  DEFAULT_BOOTSTRAP_PORT,
  DEFAULT_QOS_SERVER_URL,
  DEFAULT_INDEXER_IP,
  DEFAULT_INDEXER_PORT,
} = require('../constants')
const logger = require('./logger')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

const modifyConfigFile = async (filePath, data) => {
  try {
    logger.info(`Modifying config file ${filePath}`)
    logger.info(JSON.stringify(data))
    const fileContent = await readFileAsync(filePath)
    const possConfig = JSON.parse(fileContent)
    if (
      (possConfig.CPoolUrl.length > 0 || possConfig.CPoolAccount > 0) &&
      (data.CPoolUrl || data.CPoolAccount)
    ) {
      logger.warn('Coin-pool-related fields already exists!')
    }
    Object.keys(data).map(key => {
      // logger.info(`writing data for key: ${key}`)
      if (Array.isArray(possConfig[key])) {
        if (Array.isArray(data[key])) {
          data[key].forEach((bootstrapConfig, index) => {
            possConfig[key][index] = Object.assign(
              {},
              possConfig[key][index],
              bootstrapConfig,
            )
          })
        } else {
          possConfig[key][0] = Object.assign({}, possConfig[key][0], data[key])
        }
      } else if (typeof possConfig[key] === 'object' && !!possConfig[key]) {
        possConfig[key] = Object.assign({}, possConfig[key], data[key])
      } else {
        possConfig[key] = data[key]
      }
    })
    logger.info('New config generated')
    logger.info(JSON.stringify(possConfig))
    await writeFileAsync(filePath, JSON.stringify(possConfig, null, 2))
    logger.info('write config file done')
    return possConfig
  } catch (err) {
    logger.error('Writing config file failed')
    logger.error(err)
    return Promise.reject(err)
  }
}

module.exports.modifyConfigFile = modifyConfigFile

module.exports.setPortsConfig = (filePath, config) => {
  logger.info(`Setting ports to config file ${filePath}`)
  logger.info(JSON.stringify(config))
  const configToWrite = { Net: {} }
  if (config.rpcport) {
    configToWrite.RPCPort = config.rpcport
  }
  if (config.tcpport) {
    configToWrite.Net.TCPPort = config.tcpport
  }
  if (config.udpport) {
    configToWrite.Net.UDPPort = config.udpport
  }
  if (config.bootstrapip) {
    configToWrite.Bootstrap = [{ IP: config.bootstrapip }]
  }
  return modifyConfigFile(filePath, configToWrite)
}

module.exports.initConfigFile = filePath => {
  logger.info('Initializing config file')
  const configToWrite = {}
  configToWrite.QosServerConfig = {
    Enable: true,
    Network: 'udp',
    Addr: DEFAULT_QOS_SERVER_URL,
    Tag: 'ppioqos',
    Dir: path.resolve(path.dirname(filePath), './qoslog'),
    MaxLinePerFile: 2000,
    HTTPTimeout: 1000,
    DirectToFile: false,
  }
  configToWrite.Bootstrap = DEFAULT_BOOTSTRAP_IPS.map((ip, idx) => ({
    Name: `default-bootstrap_${idx}`,
    IP: ip,
    UDPPort: DEFAULT_BOOTSTRAP_PORT,
    TCPPort: DEFAULT_BOOTSTRAP_PORT,
    HTTPPort: 0,
    RPCPort: 0,
  }))
  configToWrite.Net = { BindIP: '0.0.0.0' }
  configToWrite.RPCHost = '0.0.0.0'
  configToWrite.Payment = { IP: DEFAULT_INDEXER_IP, HTTPPort: DEFAULT_INDEXER_PORT }

  return modifyConfigFile(filePath, configToWrite)
}

module.exports.setCpoolConfig = (filePath, host, address) => {
  logger.info('"setCpoolConfig" method called')
  logger.info(`cpool host: ${host}; cpool address: ${address}`)
  const configToWrite = {
    CPoolUrl: `${host.replace(/\/$/, '')}/api`,
    CPoolAccount: address,
  }
  return modifyConfigFile(filePath, configToWrite)
}

module.exports.clearCpoolConfig = filePath => {
  logger.info('"clearCpoolConfig" called')
  const configToWrite = {
    CPoolUrl: '',
    CPoolAccount: null,
  }
  return modifyConfigFile(filePath, configToWrite)
}

module.exports.modifyConfigFile = modifyConfigFile
