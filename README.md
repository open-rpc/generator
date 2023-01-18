# OpenRPC Generator

<center>
  <span>
    <img alt="CircleCI branch" src="https://img.shields.io/circleci/project/github/open-rpc/generator/master.svg">
    <img src="https://codecov.io/gh/open-rpc/generator/branch/master/graph/badge.svg" />
    <img alt="npm" src="https://img.shields.io/npm/dt/@open-rpc/generator.svg" />
    <img alt="GitHub release" src="https://img.shields.io/github/release/open-rpc/generator.svg" />
    <img alt="GitHub commits since latest release" src="https://img.shields.io/github/commits-since/open-rpc/generator/latest.svg" />
  </span>
</center>

A Generator tool for [open-rpc](https://github.com/open-rpc/spec) APIs.

Need help or have a question? Join us on [Discord](https://discord.gg/gREUKuF)!

## Features:

- Built in components for:
  - Clients
  - Server
  - Documentation
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
### Custom Component Generation Configuration
Here for customComponent we specify the module that exports as 
default the type IComponentModule see custom-test-component.js as an example. It is easy to also refer to an npm package as well as a plain js file. customType is can be anything , it is not restricted to client | server | doc naming.
```
{
  "openrpcDocument": "./src/awesome-custom-client_openrpc.json",
  "outDir": "generated-client",
  "components": [
      {
          "type": "custom",
          "name": "awesome-custom-client",
          "language": "typescript",
          "customComponent": "./src/custom-test-component.js",
          "customType": "client"
      } 
  ]
}
```
## Resources

- [@open-rpc/generator package](https://www.npmjs.com/package/@open-rpc/generator)
- [example open-rpc documents](https://github.com/open-rpc/examples/tree/master/service-descriptions)
