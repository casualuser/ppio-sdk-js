const axios = require('axios')

const methodMap = require('../methodMap.json')
const logger = require('./logger')

function genRPCReqBody(method, params) {
  const rpcMethod = method

  const methodParams = methodMap[rpcMethod]
  const rpcParams = []
  let paramsInvalid = false
  let lostParams = []
  if (methodParams) {
    methodParams.forEach((methodParam, index) => {
      if (methodParam.required && params[methodParam.name] === undefined) {
        if (methodParam.default) {
          rpcParams[index] = methodParam.default
          return
        }
        logger.error(`Required parameter ${methodParam.name} not found.`)
        paramsInvalid = true
        lostParams.push(methodParam.name)
        return
      }
      rpcParams[index] = params[methodParam.name]
    })
  } else {
    return new Error(`Method ${rpcMethod} not defined`)
  }

  if (paramsInvalid) {
    return new Error(
      `Invalid parameters for ${rpcMethod}! Required parameters: ${lostParams.join(
        ', ',
      )} not found.`,
    )
  }

  return { rpcMethod, rpcParams }
}

function execRPC(method, params) {
  logger.info(`Calling PPIO RPC method: ${method}, params: ${JSON.stringify(params)}`)

  let rpcport = params.rpcport
  delete params.rpcport

  const resHandler = res => {
    let resObj = {}
    if (typeof res === 'string') {
      try {
        resObj = JSON.parse(res)
      } catch (err) {
        logger.error(err)
        resObj = res
      }
    } else {
      resObj = res.data
    }
    if (resObj.error) {
      logger.error(`RPC method ${method} failed`)
      logger.error(resObj.error)
      return Promise.reject(resObj.error)
    }
    if (resObj.result || resObj.result === null) {
      logger.info(`RPC method ${method} succeed! Result: `)
      logger.info(resObj.result)
      if (typeof resObj.result === 'string') {
        if (method === 'stopDaemon') {
          return rpcport
        }
        try {
          const result = JSON.parse(resObj.result)
          return result
        } catch (err) {
          return resObj.result
        }
      }
      return resObj.result
    }
    logger.error(`No result for ${method}. Response:`)
    logger.error(resObj)
    return Promise.reject(resObj)
  }

  const rpcData = genRPCReqBody(method, params)
  if (rpcData instanceof Error) {
    return Promise.reject(rpcData)
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    data: {
      jsonrpc: '2.0',
      method: rpcData.rpcMethod,
      params: rpcData.rpcParams,
    },
  }
  if (!rpcport) {
    return Promise.reject(new Error('Please provide "rpcport" parameter'))
  }
  options.url = `http://127.0.0.1:${rpcport}/rpc`
  logger.info(`Calling PPIO RPC method: ${rpcData.rpcMethod}, final request options:`)
  logger.info(JSON.stringify(options))
  return axios(options).then(resHandler)
}

module.exports = execRPC
