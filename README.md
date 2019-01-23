# Node.js SDK

## Introduction
The ppio-sdk-js provides a node.js SDK that encapsulates the JSON-RPC services provided by ppio. Developers who want to use the SDK need to download the [ppio executable](https://www.pp.io/download.html) and start the ppio service in the background fisrt.

## Getting started
### Prepare your PPIO wallet account
You must have a PPIO wallet accountfirst. Because PPIO wallet account is your user credentials for using PPIO services. You have to get `keystore file` and `passphrase` from your PPIO wallet account.

This is a [guide](https://www.pp.io/docs/wallet/) to teach you how to generate a PPIO wallet account and get `keystore file` and `passphrase` from your PPIO wallet account

### Install ppio-sdk-js
```
npm install ppio
```

### Download ppio
Since ppio-sdk-js does not provide ppio executable. You need to download it first.
- **Windows:**  
  Download the binary from [here](https://resource.testnet.pp.io/poss/release/windows-amd64/latest/poss.exe).
  ``` powershell
    poss.exe --help
  ```

- **Mac OsX**  
    ``` bash
      curl -o ppio https://resource.testnet.pp.io/poss/release/macos/latest/poss
      chmod +x poss
      ./poss --help
    ```

- Linux:  
    ``` bash
      curl -o ppio https://resource.testnet.pp.io/poss/release/linux-amd64/latest/poss
      chmod +x poss
      ./poss --help
    ```


### Initialize PPIO and start a PPIO service in the background
You can do these by [PPIO CLI](https://www.pp.io/docs/cli/#init).
- **macOS**  or **Linux**
    ```bash
    # import your wallet user credentials into PPIO CLI
    ./poss init --keystore=[your keystore file absolute path]

    # start the PPIO service background
    ./poss start --daemon --key-passphrase=[passphrase of your keystore]
    ```
    or
    ```bash
    # import your wallet user credentials into PPIO CLI and start the PPIO service background
    ./poss start --daemon --keystore=[your keystore file absolute path] --key-passphrase=[passphrase of your keystore]
    ```
- **Windows**
    ```powershell
    # import your wallet user credentials into PPIO CLI
    ppio.exe init --keystore=[your keystore file absolute path]

    # start the PPIO service background
    poss.exe start --daemon --key-passphrase=[passphrase of your keystore]
    ```
    or
    ```powershell
    # import your wallet user credentials into PPIO CLI and start the PPIO service background
    poss.exe start --daemon --keystore=[your keystore file absolute path] --key-passphrase=[passphrase of your keystore]
    ```
> You can get `keystore file` and `passphrase` from your PPIO wallet. This is the [guide](https://www.pp.io/docs/wallet/#generate-a-ppio-wallet-account)

Or you can do these by this SDK(only in Node.js environment):
```javascript
const ppio = require('ppio')
const ppio = new ppio({
  ppioExecutablePath: 'path/to/ppio/executable',
  ...otherOptions
})
ppio.initDaemon([options])
ppio.startDaemon({
  'keystore': [your keystore file],
  'passphrase': [your passphrase],
  ...otherOptions
})
```
Check available ppio constructor options in [Configuration](#usage/configuration) and init daemon options in [initDaemon](https://www.pp.io/docs/cli/#init)

### create a bucket
You need to create a bucket first to upload objects.
```javascript
ppio.call('CreateBucket', { bucket: 'test-bucket' })
```

### put an object
```javascript
ppio.call('PutObject', {
  bucket: 'test-bucket',
  key: 'testfile.abc',
  body: 'path/to/the/test/file',
  chiprice: 100,
  copies: 5,
  expires: new Date('2020-01-01').toISOString(),
})
```

### get an object
```javascript
ppio.call('GetObject', {
  bucket: 'test-bucket',
  key: 'testfile.abc',
  chiprice: 100,
  outfile: 'path/to/the/destination',
})
```

### stop the daemon
```javascript
ppio.call('StopDaemon')
```

## Usage

### Creat a instance
```javascript
const ppio = require('ppio')
const ppio = new ppio({
  ppioExecutablePath: 'path/to/ppio/executable',
  rpcport: 18060,
})
```
#### configuration         
| Param | Type | Description |
| ------ | ------ | ------ |
| [options] | `object` | The options of ppio instance |
| [options.ppioExecutablePath] (optional) | `string` | The path of the ppio executable, will take no effect in browsers. |
| [options.rpcport] (optional) | `number` | The RPC port of a running PPIO daemon. If you are running PPIO daemon from the terminal, use this config to indicate the RPC port the daemon is listening. |

### Initialize a data directory
```javascript
ppio.initDaemon({
  datadir: 'path/to/ppio-dir',
})
```
This will create a folder(`path/to/ppio-dir`) in which ppio will store user's data. You can check the initial configuration in `ppio.conf` under the `datadir` you provided. It is highly recommended that you provide a different `datadir` for every account.

::: warning NOTE:
this method only works in Node.js environment, and `ppioExecutablePath` must be provided when creating the ppio instance.
:::
Complete configuration can be found in [PPIO JSON-RPC API Reference](https://www.pp.io/docs/api/).

### Start a PPIO daemon
```javascript
ppio.startDaemon({
  'datadir': '.ppio-demo'
  'wallet-key': 'your private key',
})
```
This will start a PPIO daemon. If you do not specify the RPC port or TCP/UDP port, ppio.js will find an available port automatically.

::: warning NOTE:
this method only works in Node.js environment, and `ppioExecutablePath` must be provided when creating the ppio instance.
:::

Complete configuration can be found in [PPIO JSON-RPC API Reference](https://www.pp.io/docs/api/).

### Stop the daemon
```javascript
ppio.stopDaemon()
```
This will stop a PPIO daemon. If you do not specify the RPC port or TCP/UDP port, ppio.js will find an available port automatically.

::: warning NOTE:
this method only works in Node.js environment, and `ppioExecutablePath` must be provided when creating the ppio instance.
:::

Complete configuration can be found in [PPIO JSON-RPC API Reference](https://www.pp.io/docs/api/).

## Other methods

### setppioExecutablePath
```javascript
ppio.setppioExecutablePath('path/to/ppio')
```
Set the PPIO executable path. It then can be accessed via `ppio.ppioPath`

### setDefaultBucket
```javascript
ppio.setDefaultBucket('test-bucket')
```
This will create a bucket with the bucket name you specified and set it as the default bucket so you do not have to provide it every time you want to modify an object. You can use this method if you want the user to use only one bucket in your app.

## Properties

### ppioPath[string]
The path of the PPIO executable.

### runningDaemonPort[number]
The RPC port that the current running daemon is listening. If you create a ppio instance with `rpcport` option, that port will be set to this property. When starting daemon, if `runningDaemonPort` is not `0`, ppio daemon will not be started for there is already a daemon running. And [stopping a daemon](#stop-the-daemon) will set `runningDaemonPort` to 0.

### baseParams[object]
Some base parameters of ppio. May include:
- rpcport: The RPC port listened by the daemon, set after the daemon is started, will be merged in `call` method params.
- netport: The TCP & UDP port used by the daemon, set after the daemon is started.
- bucket: The default bucket name, will be merged in `call` method params.
- indexerUrl: The indexer url, will be set after `init`
