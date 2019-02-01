const { readJson } = require('fs-extra');
const refParser = require('json-schema-ref-parser');
const fetch = require('node-fetch');
const isUrl = require('is-url');

const cwd = process.cwd();

const handleRawJson = (jsonString) => {
  try { return JSON.parse(jsonString); }
  catch(e) { return false; }
};

module.exports = async function getSchema(schema) {
  let parsedSchema = handleRawJson(schema);

  if (schema === undefined) {
    schema = `${cwd}/openrpc.json`;
  }

  if (parsedSchema) {
  } else if (schema && isUrl(schema)) {
    try {
      const response = await fetch(schema);
      parsedSchema = await response.json();
    } catch(e) {
      throw new Error(`Unable to download openrpc.json file located at the url: ${schema}`);
    }
  } else {
    try {
      parsedSchema = await readJson(schema);
    } catch (e) {
      if (e.message.includes('SyntaxError')) {
        throw new Error(`Failed to parse json in file ${schema}`);
      } else {
        throw new Error(`Unable to read openrpc.json file located at ${schema}`);
      }
    }
  }

  try {
    return await refParser.dereference(parsedSchema);
  } catch(e) {
    throw new Error(`The json schema provided cannot be dereferenced. Received Error: \n ${e.message}`);
  }
}
