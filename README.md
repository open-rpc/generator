# OpenRPC Generator

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/generator-client/master.svg">
    <img src="https://codecov.io/gh/open-rpc/generator-client/branch/master/graph/badge.svg" />
    <img alt="Dependabot status" src="https://api.dependabot.com/badges/status?host=github&repo=open-rpc/generator-client" />
    <img alt="Chat on Discord" src="https://img.shields.io/badge/chat-on%20discord-7289da.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/generator-client.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/generator-client.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/generator-client/latest.svg" />
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

```shell
$ open-rpc-generator-client --help
Usage: open-rpc-generator-client [options]

Options:
  -v, --version                      output the version number
  -d, --document [openrpcDocument]   JSON string or a Path/Url pointing to an open rpc schema (default: "./openrpc.json")
  -o, --outputDir [outputDirectory]  output directory that the clients will be generated into (default: "./")
  --ts-name [packageName]            Name that will go in the package.json for the typescript client (default: "template-client")
  --rs-name [crateName]              Name that will go in the crate name for the rust client (default: "template-client")
  -h, --help                         output usage information
```

### Generating a Client

```shell
$ open-rpc-generator-client \
  -d https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore-openrpc.json
```

Using the `open-rpc-generator-client` command, then passing an example OpenRPC document `petstore-openrpc.json` in the directory of `Petstore`.

The generator client tool creates the client directories by language. E.i: `rust/` for generated Rust client and `typescript` for generated Typescript (JavaScript) client. A developer can choose which client language they want to use from here.

## Resources

- [@open-rpc/generator-client package](https://www.npmjs.com/package/@open-rpc/generator-client)
- [example open-rpc documents](https://github.com/open-rpc/examples/tree/master/service-descriptions)
