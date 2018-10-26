const axios = require('axios')

const logger = require('./utils/logger')

class CpoolService {
  constructor(initData) {
    if (!initData.host || !initData.address || !initData.apiList) {
      logger.error('parameter invalid for creating CpoolService')
    }
    logger.info(`creating cpool service for ${initData.host}`)
    logger.info(JSON.stringify(initData))
    this.host = initData.host
    this.address = initData.address
    this.description = initData.description
    this.apiList = initData.apiList
    this.site = initData.site
  }
  getSubscriptionInfo(userAddress) {
    logger.info(`getting subscription info for ${userAddress}`)
    const reqData = {
      url: `${this.host}${this.apiList.subscribe_info.url}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      data: {
        account_id: userAddress,
      },
    }
    logger.info(reqData.data)
    return axios(reqData).then(res => {
      logger.info('cpool subscript info got')
      logger.info(JSON.stringify(res.data))
      if (res.data.err_code === 0) {
        return res.data.data
      }
      return Promise.reject(res)
    })
  }
}

module.exports = CpoolService
