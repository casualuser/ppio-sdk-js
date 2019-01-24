# ppio.js 

Node.js SDK for [PPIO](https://www.pp.io/docs/guide/) storage service.

## Introduction
ppio.js is the Node.js SDK for [PPIO](https://www.pp.io/docs/guide/). It provides an encapsulation of JSON-RPC interface provided by the [PPIO executable](https://www.pp.io/download.html#cli).

Note: developers who want to use this SDK need to have the [PPIO executable](https://www.pp.io/download.html).

## Getting started

### Prepare your PPIO wallet account
You must have a PPIO wallet account first to play with PPIO's products and this library. There is a [guide](https://www.pp.io/docs/wallet/) on how to generate a PPIO wallet account and get the `keystore` and `passphrase` of it.

### Installation
```
npm install ppio
```

### Download ppio
Since ppio.js does not provide the PPIO executable, you need to get it from [our website](https://www.pp.io/download.html#cli) or from your terminal:
- **Windows**  
  Download the binary from [here](https://resource.testnet.pp.io/poss/release/windows-amd64/latest/poss.exe).
  ``` powershell
    poss.exe --help
  ```
- **Mac OsX**  
    ``` bash
      curl -o poss https://resource.testnet.pp.io/poss/release/macos/latest/poss
      chmod +x poss
      ./poss --help
    ```
- **Linux**  
    ``` bash
      curl -o poss https://resource.testnet.pp.io/poss/release/linux-amd64/latest/poss
      chmod +x poss
      ./poss --help
    ```

### Initialize and start service
You need to initialize a PPIO directroy and start the PPIO daemon service from it.

You can do these by [PPIO CLI](https://www.pp.io/docs/cli/#init):
- **macOS**  or **Linux**
    ```bash
    # import your keystore into PPIO CLI
    ./poss init --keystore=[the absolute path of your keystore file] --datadir='path/to/ppio-dir'

    # start the PPIO service
    ./poss start --key-passphrase=[your passphrase] --datadir='path/to/ppio-dir'
    ```
    or
    ```bash
    # import your wallet user credentials into PPIO CLI and start the PPIO service background
    ./poss start --keystore=[the absolute path of your keystore file] --key-passphrase=[your passphrase] --datadir='path/to/ppio-dir'
    ```
- **Windows**
    ```powershell
    # import your wallet user credentials into PPIO CLI
    poss.exe init init --keystore=[the absolute path of your keystore file] --datadir='path/to/ppio-dir'

    # start the PPIO service background
    poss.exe start --key-passphrase=[your passphrase] --datadir='path/to/ppio-dir'
    ```
    or
    ```powershell
    # import your wallet user credentials into PPIO CLI and start the PPIO service background
    poss.exe start --keystore=[the absolute path of your keystore file] --key-passphrase=[your passphrase] --datadir='path/to/ppio-dir'
    ```
> You can get `keystore` and `passphrase` from your [PPIO wallet](https://wallet.testnet.pp.io). This is the [guide](https://www.pp.io/docs/wallet/#generate-a-ppio-wallet-account)
> Complete CLI configuration can be found in [PPIO CLI documentation](https://www.pp.io/docs/cli/).

You can also do these by this SDK(only in Node.js environment):
```javascript
const Ppio = require('ppio')
const ppio = new Ppio({
  ppioExecutablePath: 'path/to/ppio/executable',
})
ppio.initDaemon([
  datadir: 'path/to/ppio-dir'
])
ppio.startDaemon({
  keystore: [your keystore file],
  passphrase: [your passphrase],
  datadir: 'path/to/ppio-dir'
})
```

Check all available Ppio constructor options in [Configuration](#usage/configuration)

### Create a bucket
You need to create a bucket to upload objects.
```javascript
ppio.callMethod('CreateBucket', { bucket: 'test-bucket' })
```

### Put an object
```javascript
ppio.callMethod('PutObject', {
  bucket: 'test-bucket',
  key: 'testfile.abc',
  body: 'path/to/the/test/file',
  chiprice: 100,
  copies: 5,
  expires: new Date('2020-01-01').toISOString(),
})
```
This will upload the file you specified in `body`, with 5 copies, store it until `2020-01-01`, and with a key of `testfile.abc`.

### Get an object
```javascript
ppio.callMethod('GetObject', {
  bucket: 'test-bucket',
  key: 'testfile.abc',
  chiprice: 100,
  outfile: 'path/to/the/destination',
})
```
This will download the file `testfile.abc` to `path/to/the/destination`.

### Stop the daemon
```javascript
ppio.callMethod('StopDaemon')
```
This will stop the daemon you started with `startDaemon()`. You can provide an `rpcport` to stop a specific daemon.

## Usage

### Creating an instance
```javascript
const Ppio = require('ppio')
const ppio = new Ppio({
  ppioExecutablePath: 'path/to/ppio/executable',
  rpcport: 18060,
})
```
#### Configuration         
| Param | Type | Description |
| ------ | ------ | ------ |
| [options] | `object` | The options of the Ppio instance |
| [options.ppioExecutablePath] (optional) | `string` | The path of the ppio executable. |
| [options.rpcport] (optional) | `number` | The RPC port of a running PPIO daemon. If you are running PPIO daemon from the terminal, use this to indicate the RPC port the daemon is listening. |
| [options.debug] (optional) | `boolean` | Whether to open debug mode of the SDK. Setting to true will show all logs inside the SDK and PPIO executable. |
| [options.bucket] (optional) | `number` | The default bucket name. Will be used on all RPC methods which need `bucket` parameter unless specified. |

### Initialize a data directory
```javascript
ppio.initDaemon({
  datadir: 'path/to/ppio-dir',
})
```
`initDaemon()` will create a folder(`path/to/ppio-dir`) in which PPIO will store user's data(keystore, logs, etc). You can check the initial configuration in `poss.conf` under the `datadir` you provided. Though optional, it is highly recommended that you specify a different `datadir` for every account. 

Complete configuration can be found in the [PPIO CLI Reference](https://www.pp.io/docs/cli/).

::: warning NOTE:
The `ppioExecutablePath` parameter must be provided when creating the instance.
:::

### Starting a PPIO daemon
```javascript
ppio.startDaemon({
  'datadir': '.ppio-demo',
})
```
This will start a PPIO daemon. If you do not specify the RPC port or TCP/UDP port, a default port `18060` will be used.

Complete configuration can be found in [PPIO CLI Reference](https://www.pp.io/docs/cli/).

::: warning NOTE:
The `ppioExecutablePath` parameter must be provided when creating the instance.
:::

### Stopping the daemon
```javascript
ppio.callMethod('StopDaemon', { rpcport: 18060 })
```
This will stop a PPIO daemon listening the specified `rpcport`. If `rpcport` is not provided, ppio.js will use the `rpcport` remembered when `startDaemon()` was called last time.

Complete configuration can be found in [PPIO JSON-RPC API Reference](https://www.pp.io/docs/api/).

### PPIO RPC Interface
```javascript
ppio.callMethod([method name], parameters)
```
All methods available in PPIO RPC interface can be accessed through `callMethod` method, and all parameters are documented in the [Reference](https://www.pp.io/docs/api/)

### setPpioExecutablePath
```javascript
ppio.setPpioExecutablePath('path/to/ppio')
```
Set the PPIO executable path. It can be accessed via `ppio.ppioPath` which can also be set by creating the Ppio instance with the `ppioExecutablePath` parameter.

### setDefaultBucket
```javascript
ppio.setDefaultBucket('default-bucket-name')
```
This will save a default bucket so you do not have to specify it every time when you want to modify an object. You can use this method if you want the user to use only one bucket in your app.

### setRPCPort
```javascript
ppio.setRPCPort(18060)
```
This will save a default RPC port number, then, unless specified, every `callMethod` call will use it as the default `rpcport` parameter. So you do not have to specify it every time. Remember to start a daemon before calling this method.

## Properties

### ppioPath[string]
The path of the PPIO executable.

### runningDaemonPort[number]
Will be set after `startDaemon` resolves. Or if you create a ppio instance with `rpcport` option, that port will be set to this property. So only create an instance with `rpcport` when there is a daemon running and you know the RPC port it's listening. When calling `startDaemon`, if `ppio.runningDaemonPort` is not `0`, ppio daemon will not be started for there is already a daemon running. And [stopping a daemon](#stop-the-daemon) will set it to 0.

### baseParams[object]
Some base parameters of ppio. May include:
- rpcport: The RPC port listened by the daemon, set after the daemon is started, will be merged in `callMethod` method params.
- bucket: The default bucket name, will be merged in `callMethod` method params.
- indexerUrl: The indexer url, will be automatically set after `startDaemon`
