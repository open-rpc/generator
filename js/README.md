# Open RPC Javascript Client Generator

```
Usage: cli [options] <clientName>

Options:
  -V, --version          output the version number
  -s, --schema [schema]  JSON string or a Path/Url pointing to an open rpc schema
  -h, --help             output usage information
```

Using Docker
`docker pull openrpc/generator-client-js`
```sh
docker run \
  -v $(pwd)/petstore/:/petstore \
  openrpc/generator-client-js \
    -o https://raw.githubusercontent.com/open-rpc/examples/master/service-descriptions/petstore.json
    petstore
```

```sh
npm install -g @open-rpc/generator-client-js

open-rpc-generator-client-js myRpc
```

open-rpc.json
```json
{
  "openrpc": "1.0.0",
  "methods": {
    "foobar": {
      "parameters": [
        {
          "name": "one",
          "schema": {
            "type": "number"
          }
        }
      ]
    }
  }
}

```

myCode.js
```js
const MyRpc = require('./myRpc');

const myRpc = new MyRpc({ transport: { type: 'http', url: 'localhost:6969' } });

myRpc.foobar(1)
  .then((result) => { ... })
  .catch((e) => { ... });
```
