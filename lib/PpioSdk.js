'use strict'
const axios = require('axios')

const methodMap = require('./methodMap.json')
const execCmd = require('./utils/execPossCmd')
const execRPC = require('./utils/reqPossRPC')
const {
  initConfigFile,
  setCpoolConfig,
  modifyConfigFile,
  clearCpoolConfig,
} = require('./utils/writeConfigFile')
const getBootstrapConf = require('./utils/getBootstrapConf.js')
const CpoolService = require('./CpoolService')
const logger = require('./utils/logger')

const isNode = typeof module !== 'undefined' && module.exports

class Ppio {
  constructor(baseParams) {
    if (baseParams.debug) {
      console.log('[ppio-sdk] sdk is in debug mode')
      logger.transports[0].silent = false
    } else {
      logger.transports[0].silent = true
    }
    if (!baseParams || !baseParams.ppioExecutablePath) {
      logger.info('You did not provide the path of ppio executable!')
    }
    this.ppioPath = baseParams.ppioExecutablePath
    logger.info(`ppio created! PPIO executable: ${this.ppioPath}`)

    this.runningDaemonPort = baseParams.rpcport || 0
    this.baseParams = {}
    if (baseParams) {
      this.baseParams = Object.assign({}, this.baseParams, baseParams)
    }

    this.cpoolServices = {}
  }

  setPpioExecutablePath(path) {
    logger.info(`setting ppio executable path: ${path}`)
    this.ppioPath = path
  }

  setRPCPort(port) {
    logger.info(`setting rpcport: ${port}`)
    this.baseParams.rpcport = port
  }

  setDefaultBucket(bucketName) {
    logger.info(`setting base bucket: ${bucketName}`)
    this.baseParams.bucket = bucketName
  }

  callMethod(method, params) {
    logger.info(`Calling PPIO method ${method}, with params: `)
    logger.info(JSON.stringify(params))
    if (!methodMap[method]) {
      logger.error(`Method ${method} not defined in method map`)
      return Promise.reject(new Error('method not exists'))
    }
    const { rpcport, bucket } = this.baseParams
    const totalParams = Object.assign({}, { rpcport }, params)
    let needBucket
    for (let i = 0; i < methodMap[method].length; i++) {
      if (methodMap[method][i].name === 'bucket') {
        needBucket = true
        break
      }
    }
    if (needBucket && totalParams.bucket === undefined) {
      totalParams.bucket = bucket
    }
    logger.info('Combined params: ')
    logger.info(JSON.stringify(totalParams))
    if (!totalParams.rpcport) {
      logger.warn('The "rpcport" parameter not found!')
      // return Promise.reject(new Error('"rpcport" parameter not found!'))
    }
    return execRPC(method, totalParams)
      .then(res => {
        if (method === 'stopDaemon') {
          this.runningDaemonPort = 0
          delete this.baseParams.rpcport
        }
        return res
      })
      .catch(err => {
        if (method === 'stopDaemon') {
          const stoppedPort = this.runningDaemonPort
          this.runningDaemonPort = 0
          delete this.baseParams.rpcport
          return Promise.resolve(stoppedPort)
        }
        return Promise.reject(err)
      })
  }

  /**
   * init poss.conf in datadir
   * @param {object} [params] - init configuration
   */
  startDaemon(params) {
    if (!isNode) {
      return Promise.reject(new Error('"startDaemon" can only be called in Node.js!'))
    }
    if (!this.ppioPath || this.ppioPath.length === 0) {
      return Promise.reject(new Error('No ppio executable path specified!'))
    }
    logger.info('starting daemon with params: ')
    logger.info(JSON.stringify(params))
    const homedir = require('os').homedir()
    const path = require('path')
    const fs = require('fs')
    if (!isNaN(this.runningDaemonPort) && this.runningDaemonPort !== 0) {
      logger.warn(
        `There is already a daemon running for this ppio instance on port: ${
          this.runningDaemonPort
        }`,
      )
      return Promise.resolve(this.runningDaemonPort)
    }

    let datadir = ''
    if (!params || !params.datadir) {
      logger.warn(
        `Did not receive "datadir" parameter, using default datadir at ${homedir}/.poss`,
      )
      datadir = path.resolve(homedir, './.poss')
    } else {
      datadir = params.datadir
    }

    return getBootstrapConf()
      .then(conf => {
        return modifyConfigFile(path.resolve(datadir, './poss.conf'), conf)
      })
      .then(possConf => {
        const indexerUrl = `http://${possConf.Payment.IP}:${possConf.Payment.HTTPPort}/rpc`
        this.baseParams.indexerUrl = indexerUrl
        return true
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          const newConfig = { testnet: 'test' }
          if (params && params.rpcport) {
            newConfig.rpcport = params.rpcport
          } else {
            logger.warn('Did not receive "rpcport" parameter.')
          }

          if (params && params.isMainnet) {
            delete newConfig.testnet
            delete params.isMainnet
          }

          if (!params || !params['key-passphrase'] || !params['keystore']) {
            logger.warn(
              'Did not receive "keystore" and "keyPassphrase" parameter, creating a new account.',
            )
          }
          execCmd(
            this.ppioPath,
            'start',
            Object.assign({}, newConfig, params),
            res => {
              if (res.data.match('start ppio user node ok')) {
                logger.info('daemon started')
                const possConf = JSON.parse(
                  fs.readFileSync(path.resolve(datadir, './poss.conf')),
                )
                console.log(possConf.RPCPort)
                // TODO
                this.runningDaemonPort = newConfig.rpcport || possConf.RPCPort
                resolve(this.runningDaemonPort)
              }
            },
            err => {
              logger.error(err.message)
              delete this.baseParams.rpcport
              this.runningDaemonPort = 0
              return reject(err.err)
            },
            exitCode => {
              logger.error(`PPIO daemon exited with code ${exitCode}`)
              delete this.baseParams.rpcport
              this.runningDaemonPort = 0
              return reject(new Error(`process exited with code ${exitCode}`))
            },
          )
        })
      })
  }

  /**
   * init poss.conf in datadir
   * @param {object} [params] - init configuration
   */
  initDaemon(params) {
    if (!isNode) {
      return Promise.reject(new Error('"initDaemon" can only be called in Node.js!'))
    }
    if (!this.ppioPath || this.ppioPath.length === 0) {
      return Promise.reject(new Error('No ppio executable path specified!'))
    }
    logger.info('Initializing daemon with params: ')
    logger.info(JSON.stringify(params))
    const path = require('path')
    const homedir = require('os').homedir()
    let datadir = ''
    if (!params || !params.datadir) {
      logger.warn(
        `Did not receive "datadir" parameter, using default datadir at ${homedir}/.poss`,
      )
      datadir = path.resolve(homedir, './.poss')
    } else {
      datadir = params.datadir
    }
    return new Promise((resolve, reject) => {
      const initConfig = Object.assign({ bindip: '0.0.0.0' }, params)
      execCmd(this.ppioPath, 'init', initConfig, undefined, undefined, exitCode => {
        logger.info(`initDaemon exit with code ${exitCode}'`)
        if (exitCode === 0) {
          initConfigFile(path.resolve(datadir, './poss.conf'))
            .then(() => resolve())
            .catch(err => reject(err))
        } else {
          reject(new Error('initDaemon failed'))
        }
      })
    })
  }

  /**
   * write cpool address and account to poss.config
   */
  setCpool(params) {
    if (!isNode) {
      return Promise.reject(new Error('"setCpool" can only be called in Node.js!'))
    }
    const path = require('path')
    if (!params || !params.address || !params.host || !params.datadir) {
      return Promise.reject(
        new Error(
          '"setCpool" method requires "datadir", "host" and "address" parameters',
        ),
      )
    }
    logger.info(
      `writing cpool data to config with host: ${params.host}, 
        address: ${params.address}, 
        in ${params.datadir}`,
    )
    return setCpoolConfig(
      path.resolve(params.datadir, './poss.conf'),
      params.host,
      params.address,
    )
  }

  /**
   * clear cpool config
   */
  clearCpool(datadir) {
    if (!isNode) {
      return Promise.reject(new Error('"clearCpool" can only be called in Node.js!'))
    }
    const path = require('path')
    if (!datadir) {
      return Promise.reject(new Error('"clearCpool" method requires "datadir" parameter'))
    }
    logger.info(`clearing cpool data from config in ${datadir}`)
    return clearCpoolConfig(path.resolve(datadir, './poss.conf'))
  }

  initCpoolServices(cpools) {
    logger.info('Initializing coin pool services of: ')
    logger.info(JSON.stringify(cpools))
    return Promise.all(
      cpools.map(cpool => {
        const reqData = {
          url: `${cpool.host}/api`,
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
        return axios(reqData)
          .then(res => {
            if (res.data.err_code === 0) {
              logger.info(`The api list of coin pool ${cpool.host} got: `)
              logger.info(JSON.stringify(res.data.data))
              return { host: cpool.host, site: cpool.site, data: res.data.data }
            }
            logger.error(`Fetching cpool api list failed for ${cpool.host}`)
            logger.error(JSON.stringify(res.data.data))
            return undefined
          })
          .catch(err => {
            logger.error(`get cpool api list failed ${cpool.host}`)
            logger.error(err)
            return Promise.resolve(undefined)
          })
      }),
    ).then(dataArr => {
      dataArr.forEach(cpoolData => {
        if (!cpoolData) {
          return
        }
        const address = cpoolData.data.address
        const description = cpoolData.data.description
        this.cpoolServices[cpoolData.host] = new CpoolService({
          host: cpoolData.host,
          address: address,
          description: description,
          apiList: cpoolData.data,
          site: cpoolData.site,
        })
      })
      return this.cpoolServices
    })
  }

  getCpoolService(host) {
    logger.info(`getCpoolService ${host}`)
    return this.cpoolServices[host] || null
  }
}

module.exports = Ppio
