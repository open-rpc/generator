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

- Built in components for:
  - Clients
  - Server
- Easy to create new components


## Usage

The generator CLI has a generate command which takes a config to run. The config specifies what components you want to make, as well as the configuration for each component.

Using the CLI's `init` command, you can walk though an interactive config builder.

### Quick start

```sh
npm install -g @open-rpc/generator

open-rpc-generator init
open-rpc-generator generate -c open-rpc-generator-config.json
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

## Resources

- [@open-rpc/generator package](https://www.npmjs.com/package/@open-rpc/generator)
- [example open-rpc documents](https://github.com/open-rpc/examples/tree/master/service-descriptions)
