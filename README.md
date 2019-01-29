# generator-client
Multi-language client generators for open rpc apis.

In action (for a js client):
```sh
docker run \
  -v $(pwd)/petstore/:/petstore \
  openrpc/generator-client-js \
    -s https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json
    petstore
```
