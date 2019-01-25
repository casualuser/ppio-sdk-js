const axios = require('axios')
const { BOOTSTRAP_JSON_URL } = require('../constants')
const logger = require('./logger')

module.exports = () => {
  logger.info('getting bootstrap.json from server')
  return axios({
    url: `${BOOTSTRAP_JSON_URL}?${Date.now()}`,
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
  }).then(res => {
    logger.info('bootstrap configs fetched: ')
    logger.debug(JSON.stringify(res.data))
    try {
      // const baseConf = JSON.parse(res.data)
      return res.data
    } catch (err) {
      logger.error('get boostrap json failed!')
      logger.error(err)
      return Promise.reject(err)
    }
  })
}
