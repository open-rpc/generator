# open-rpc-generator-client
Multi-language client generators for [open-rpc](https://github.com/open-rpc/spec) apis.

[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=open-rpc/generator-client)](https://dependabot.com)

Install using npm
```
npm install -g @open-rpc/generator-client
```

Check install or update package

```
open-rpc-generator-client --version

npm -g update @open-rpc/generator-client
```

Generate client
```
open-rpc-generator-client \
  -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore-openrpc.json \
  PetStore
```

In action (for a js client):
```sh
docker run \
  -v $(pwd)/petstore/:/petstore \
  openrpc/generator-client \
    -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore-openrpc.json
    petstore
```

### Contributing

How to contribute, build and release are outlined in [CONTRIBUTING.md](CONTRIBUTING.md), [BUILDING.md](BUILDING.md) and [RELEASING.md](RELEASING.md) respectively. Commits in this repository follow the [CONVENTIONAL_COMMITS.md](CONVENTIONAL_COMMITS.md) specification.
