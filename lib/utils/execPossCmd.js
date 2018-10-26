const { spawn } = require('child_process')
const logger = require('./logger')

function genCmdArgs(params) {
  if (!params) {
    return []
  }
  logger.info('generating spawn params from: ')
  logger.info(JSON.stringify(params))
  const cmdArgs = Object.keys(params).map(key => {
    // remove quotes
    const paramVal =
      typeof params[key] === 'string'
        ? params[key].replace(/["|'](.*)['|"]/, (match, $1) => $1)
        : params[key]
    return `--${key}=${paramVal}`
  })
  logger.info('spawn params generated: ')
  logger.info(cmdArgs)
  return cmdArgs
}

function execCmd(binPath, subcmd, params, onData, onError, onExit) {
  const cmdArgs = genCmdArgs(params)
  const spawnBody = [subcmd].concat(cmdArgs)

  logger.info(`Executing command by spawn: ${binPath} ${spawnBody.join(' ')}`)
  const possProcess = spawn(binPath, spawnBody, {})

  possProcess.stdout.on('data', data => {
    logger.info(data.toString())
    if (typeof onData === 'function') {
      onData({
        data: data.toString(),
        process: possProcess,
      })
    }
  })

  possProcess.stderr.on('data', data => {
    logger.info(data.toString())
    if (typeof onData === 'function') {
      onData({
        data: data.toString(),
        process: possProcess,
      })
    }
  })

  possProcess.on('error', err => {
    logger.error(`execCmd error. errorCode: ${err.code}`)
    logger.error(err.toString())
    if (typeof onData === 'function') {
      onData({
        data: err.toString(),
        process: possProcess,
      })
    }
  })

  possProcess.on('exit', code => {
    logger.info(`Child process exited with code ${code}`)
    if (typeof onExit === 'function') {
      onExit(code)
    }
  })
}

module.exports = execCmd
