# generator-client
Multi-language client generators for open rpc apis.

In action (for a js client):
```sh
docker run \                                 # docker is the only dependency
  -v $(pwd)/openrpc.json:/openrpc.json:ro \  # provide the openrpc schema, read-only
  -v $(pwd)/build/:/build/ \                 # give a build directory to write the client to
  openrpc/generator-client-js                # get the image for the language you need!
```

To build clients for all the supported languages:
`docker-app install open-rpc/generator-client-all:latest --set config=$(pwd)/openrpc.json`
