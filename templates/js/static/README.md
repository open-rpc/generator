# OPEN-RPC Client

Generated OpenRPC client.

## Dependencies

* [TypeScript](https://www.typescriptlang.org/)
* _At least_ Node 8x.
* [VSCode](https://code.visualstudio.com/) + [OPEN-RPC vscode extension](https://marketplace.visualstudio.com/items?itemName=OPEN-RPC.OPEN-RPC).
    The extension provides realtime completion and validation for OPEN-RPC openrpc.json documents.


After generating a template client `cd` into the client directory and `ls`.

```
build             docs              index.ts          node_modules      package-lock.json package.json      tsconfig.json     tslint.json
```

## Understanding the Structure

* buidl/: the built or --out directory of the client.
 
  `tsconfig.json` sample:
  ``` 
    "outDir": "build",
    "declarationDir": "build",
  ```

* docs/: contains static documentation website based on the client generated with [TypeDoc](https://typedoc.org/)
  
  TypeDoc is imported by node module for dynamic configuration and generates docs from the client `build/index`.

  `package.json` sample:
  ```
  {
  "name": "template-client",
  "version": "1.0.0",
  "description": "",
  "main": "build/index.js",
  "scripts": {
    "build": "tsc && typedoc --out docs",
    "lint": "tslint -c tslint.json 'src/**/*.ts'",
    "publish": "npm publish --access=public"
  },
  ```

* index.ts: 

* tsconfig.ts: TypeScript compiler configuration file.
 