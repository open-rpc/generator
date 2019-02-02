const { readJson } = require('fs-extra');
const refParser = require('json-schema-ref-parser');
const fetch = require('node-fetch');
const isUrl = require('is-url');

const cwd = process.cwd();

const isJson = (jsonString) => {
  try { JSON.parse(jsonString); return true; }
  catch(e) { return false; }
};

const fetchUrlSchemaFile = async (schema) => {
  try {
    const response = await fetch(schema);
    return await response.json();
  } catch(e) {
    throw new Error(`Unable to download openrpc.json file located at the url: ${schema}`);
  }
};


const readSchemaFromFile = async (schema) => {
  try {
    return await readJson(schema);
  } catch (e) {
    if (e.message.includes('SyntaxError')) {
      throw new Error(`Failed to parse json in file ${schema}`);
    } else {
      throw new Error(`Unable to read openrpc.json file located at ${schema}`);
    }
  }
};


module.exports = async function getSchema(schema) {
  let parsedSchema;

  if (schema === undefined) {
    schema = `${cwd}/openrpc.json`;
  }

  if (isJson(schema)) {
    parsedSchema = JSON.parse(schema);
  } else if (isUrl(schema)) {
    parsedSchema = await fetchUrlSchemaFile(schema);
  } else {
    parsedSchema = await readSchemaFromFile();
  }

  try {
    return await refParser.dereference(parsedSchema);
  } catch(e) {
    throw new Error(`The json schema provided cannot be dereferenced. Received Error: \n ${e.message}`);
  }
}
