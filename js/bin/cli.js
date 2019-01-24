#!/usr/bin/env node

const program = require('commander');
const orpcGenerator = require('../src');

program
  .version('1.0.0')
  .usage('[options] <clientName>')
  .arguments('<clientName>')
  .option('-o, --openrpcjson [openrpcjson]', 'Path or Url to openrpc.json file')
  .action((clientName) => {
    orpcGenerator({ clientName, openrpcjson: program.openrpcjson })
      .then(() => {
        console.log('Finished! Client has been generated.')
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  })
  .parse(process.argv);
