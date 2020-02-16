# Snaps OpenRPC Generator

Generate High end snaps in a snap.

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/xops/snaps-openrpc-generator/master.svg">
    <img src="https://codecov.io/gh/xops/snaps-openrpc-generator/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=xops/snaps-openrpc-generator" />
    <img alt="Chat on Discord" src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@xops/snaps-openrpc-generator.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/xops/snaps-openrpc-generator.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/xops/snaps-openrpc-generator/latest.svg" />
    <img alt="js badge" src="https://img.shields.io/badge/js-javascript-yellow.svg" />
    <img alt="rs badge" src="https://img.shields.io/badge/rs-rust-brown.svg" />
  </span>
</center>


A Generator tool for creating [Metamask Snaps](https://github.com/MetaMask/snaps-cli) using [open-rpc](https://github.com/open-rpc/spec) APIs.

## Features:

- Multi-language
  - typescript
  - rust
- Can generate:
  - Clients for accessing your plugin
  - Typed plugin scaffolding

## Install

```shell
$ npm install -g @xops.net/snaps-openrpc-generator
```

## Usage

### Using it in your project

Make a new folder for your Plugin project
```shell
$ mkdir MyPlugin && cd MyPlugin
```

Write an OpenRPC Document that describes your plugins interface, and includes any documentation, examples, etc you may want. You can start with one of the [OpenRPC examples](http://github.com/open-rpc/examples), write your own with the help of the [OpenRPC Playground](playground.open-rpc.org), or start from the hello world snap:
```shell
echo '{
  "openrpc": "1.2.4",
  "info": {
    "title": "MySnap",
    "version": "1.0.0"
  },
  "methods": [
    {
      "name": "hello",
      "params": [],
      "result": {
        "name": "helloWorldResult",
        "schema": {
          "type": "string"
        }
      }
    }
  ],
  "examples": [
    {
      "name": "helloWorldExample",
      "params": [],
      "result": {
        "name": "world",
        "value": "world"
      }
    }
  ]
}' > openrpc.json
```

Create a generator config file

```shell
$ snaps-openrpc-generator init
```

Generate artifacts based on your config

```shell
$ snaps-openrpc-generator generate -c openrpc-generator-config.json
```

## Resources

- [@open-rpc/generator package](https://www.npmjs.com/package/@open-rpc/generator)
- [example open-rpc documents](https://github.com/open-rpc/examples/tree/master/service-descriptions)
