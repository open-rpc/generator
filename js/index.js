const _ = require('lodash');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const fsx = require('fs-extra');
const refParser = require('json-schema-ref-parser');
const { reduce, map } = require('lodash');
const { exec } = require('child_process');

async function getSchema() {
  let schemaFile;
  try {
    schemaFile = await readFile('./openrpc.json', 'utf8');
  } catch (e) {
    console.error(new Error(`Could not find ./openrpc.json file in ${process.cwd()}`));
    process.exit(1);
  }

  let rawSchema;
  try {
    rawSchema = JSON.parse(schemaFile);
  } catch (e) {
    console.error(new Error(`Could not parse ./openrpc.json file: Malformed JSON`));
    process.exit(1);
  }

  try {
    return refParser.dereference(rawSchema);
  } catch(e) {
    console.error(new Error(`Could not parse ./openrpc.json file: Malformed JSON`));
    process.exit(1);
  }
}

function generateMethods(schema) {
  return reduce(schema.methods, (result, methodObject, methodName) => {
    result[methodName] = function(...args) {
      return new Promise((resolve, reject) => {
        this.rpc.request(methodName, args, (err, result) => {
          if (err) return reject(err);
          return resolve(result);
        });
      });
    };
    return result;
  }, {});
}

function createWritableMethodsObject(methods) {
  let methodString = 'const methods = { \n';
  const methodLines = map(methods, (method, methodName) => `${methodName}: ${method.toString().replace('methodName', `'${methodName}'`)}`);
  methodString += methodLines.join(', \n');
  methodString += '\n};';

  return methodString;
}

function generateClass(funcs) {
  class Foo {
    constructor(options) {
      if (options.transport.type === 'http') {
        this.rpc = jayson.client.http({ port: options.transport.port || 80 });
      }
    }
  };

  const methodNames = Object.keys(funcs);
  const methodFuncs = Object.values(funcs);

  methodNames.forEach((methodName, i) => Foo.prototype[methodName] = methodFuncs[i]);

  return Foo;
}

const generatedClassName = process.argv[2];

const openRpcSchema = getSchema().then(async (schema) => {
  const templates = await readFile('./client-templated/exported-class.ts.tmpl', 'utf8');
  const compile = _.template(templates);
  const result = compile({ className: generatedClassName, methodNames: Object.keys(schema.methods) });
  await fsx.ensureDir(`${process.cwd()}/build`);
  await fsx.emptyDir(`${process.cwd()}/build`);
  fsx.copy('./client-static', './build');
  await writeFile(`build/${generatedClassName}.ts`, result, 'utf8');
  console.log(`build successful. Client has been written to build/${generatedClassName}.js`);

  exec('cd build && npm install && npm run build', (err, stdout, stderr) => {
    if (err) throw err;
    console.log('build the dist! away you go!');
  });
});
