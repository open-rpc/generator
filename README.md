# OpenRPC Generator

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/generator/master.svg">
    <img src="https://codecov.io/gh/open-rpc/generator/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/generator" />
    <img alt="Chat on Discord" src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/generator.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/generator.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/generator/latest.svg" />
    <img alt="js badge" src="https://img.shields.io/badge/js-javascript-yellow.svg" />
    <img alt="rs badge" src="https://img.shields.io/badge/rs-rust-brown.svg" />
  </span>
</center>


A Generator tool for [open-rpc](https://github.com/open-rpc/spec) APIs.

## Features:

- Multi-language
  - typescript
  - rust
- Can generate:
  - clients for accessing your service
  - server scaffolding

## Install

```shell
$ npm install -g @open-rpc/generator
```

## Usage

### Using it in your project

Create a generator config file

```shell
$ open-rpc-generator init
```

Generate artifacts based on your config

```shell
$ open-rpc-generator generate -c open-rpc-generator-config.json
```

Usage: open-rpc-generator [options]

Options:
  -v, --version                      output the version number
  -d, --document [openrpcDocument]   JSON string or a Path/Url pointing to an open rpc schema (default: "./openrpc.json")
  -o, --outputDir [outputDirectory]  output directory that the clients will be generated into (default: "./")
  --ts-name [packageName]            Name that will go in the package.json for the typescript client (default: "template-client")
  --rs-name [crateName]              Name that will go in the crate name for the rust client (default: "template-client")
  -h, --help                         output usage information
```

### Generating an individual component

```shell
$ open-rpc-generator-client generate
  -t client
  -l typescript
  -n petstoreClientTs
  -d https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore-openrpc.json
  -o ./generated
```

In this example the generated client is written to `./generated`

## Resources

- [@open-rpc/generator package](https://www.npmjs.com/package/@open-rpc/generator)
- [example open-rpc documents](https://github.com/open-rpc/examples/tree/master/service-descriptions)
