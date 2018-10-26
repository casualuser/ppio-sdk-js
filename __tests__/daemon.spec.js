'use strict'
const shell = require('shelljs')
const path = require('path')
const Poss = require('../index')

const TEST_USER_DIR = path.resolve(__dirname, './datadir-test')

const poss = new Poss({
  debug: true,
  possExecutablePath: path.resolve('../bin/poss'),
})

shell.rm('-rf', TEST_USER_DIR)

it('does not work without datadir', () => {
  expect.assertions(1)
  return poss.startDaemon({ bindip: '0.0.0.0' }).catch(err => {
    expect(err.message).toMatch('"daemonStart" method requires "datadir" parameter')
  })
})

it('works with datadir & bindip', () => {
  expect.assertions(1)
  jest.setTimeout(8000)
  return poss.startDaemon({
    datadir: TEST_USER_DIR,
    bindip: '0.0.0.0',
  }).then(process => {
    console.log('stoping daemon')
    return poss.stopDaemon().then(res => {
      console.log('[stop daemon response]: ')
      console.log(res)
      expect(res).toBe(undefined)
    })
  })
})

// socket hang up???
// setTimeout(function(){user.daemonStop(params, callback)}, 3000 * 1);
//setTimeout(function(){user.daemonStopCmd(params, callback)}, 3000 * 1);
//setTimeout(function(){user.daemonStop(params)}, 3000 * 1);
