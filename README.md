# generator-client
Multi-language client generators for [open-rpc](https://github.com/open-rpc/spec) apis.

[![Dependabot badge](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg?logo=dependabot)](https://dependabot.com/)

using npm:
```
npm install -g @open-rpc/generator-client
open-rpc-generator-client \
  -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json \
  PetStore
```
In action (for a js client):
```sh
docker run \
  -v $(pwd)/petstore/:/petstore \
  openrpc/generator-client-js \
    -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json
    petstore
```
