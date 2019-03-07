#!/usr/bin/env node

const program = require('commander');
const orpcGenerator = require('../src');
const parseSchema = require('@open-rpc/schema-utils-js');

program
  .version(require('./get-version'))
  .usage('[options] <clientName>')
  .arguments('<clientName>')
  .option('-s, --schema [schema]', 'JSON string or a Path/Url pointing to an open rpc schema')
  .action(async (clientName) => {
    const schema = await parseSchema(program.schema);

    orpcGenerator({ clientName, schema, languages: ['js'] })
      .then(() => {
        console.log('Finished! Client has been generated.')
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
  })
  .parse(process.argv);
