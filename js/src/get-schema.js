const { readJson } = require('fs-extra');
const refParser = require('json-schema-ref-parser');
const fetch = require('node-fetch');

const cwd = process.cwd();

module.exports = async function getSchema(schemaString) {
  let schema;

  if (schemaString === undefined) {
    schemaString = `${cwd}/openrpc.json`;
  }

  const isUrl = schemaString.includes('http') || schemaString.includes('https');
  if (schemaString && isUrl) {
    try {
      const response = await fetch(schemaString);
      schema = await response.json();
    } catch(e) {
      throw new Error(`Unable to download openrpc.json file located at the url: ${schemaString}`);
    }
  } else {
    try {
      schema = await readJson(schemaString);
    } catch (e) {
      throw new Error(`Unable to read openrpc.json file located at ${schemaString}`);
    }
  }

  try {
    return await refParser.dereference(schema);
  } catch(e) {
    throw new Error(`The json schema provided cannot be dereferenced. Received Error: \n ${e.message}`);
  }
}
