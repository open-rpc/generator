# Open RPC Javascript Client Generator


```sh
npm install -g @open-rpc/generator-client-js

orpc-generator-client-js myRpc
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
