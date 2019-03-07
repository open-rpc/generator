#!/usr/bin/env node
const _ = require('lodash');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const fsx = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

const cwd = process.cwd();
const { compile, compileFromFile } = require('json-schema-to-typescript');

const jsTemplate = require('../templates/js/templated/exported-class.template');

const cleanBuildDir = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);
};

const getTypeId = (method, contentDescriptor) => {
  const paramId = method.paramStructure === 'by-name' ? contentDescriptor.name : (method.params.indexOf(contentDescriptor) || method.result === contentDescriptor);
  return `${method.name}/${paramId}`
};

const getTypeName = (contentDescriptor) => {
  const {schema} = contentDescriptor;
  const prefix = (schema.type === undefined || schema.type.includes(['string', 'number', 'boolean'])) ? 'T' : 'I';
  return `${prefix}${contentDescriptor.name}`;
};

const getTypings = async ({ methods }) => {
  const contentDescriptors = _(methods)
    .map((method) => ({
      method,
      contentDescriptors: [...method.params, method.result]
    }))
    .flatMap(({ method, contentDescriptors }) => _.map(contentDescriptors, (contentDescriptor) => ({
      method,
      contentDescriptor
    })))
    .filter(({ contentDescriptor }) => contentDescriptor.schema !== undefined)
    .map(async ({ method, contentDescriptor }) => ({
      typeId: getTypeId(method, contentDescriptor),
      typeName: getTypeName(contentDescriptor),
      typings: await compile(contentDescriptor.schema, getTypeName(contentDescriptor), { bannerComment: '' })
    }))
    .value();

  const typingsToAddToTemplate = await Promise.all(contentDescriptors);

  return _(typingsToAddToTemplate)
    .keyBy('typeId')
    .value();
};

const compileTemplate = async (name, schema) => {
  const typeDefs = await getTypings(schema);

  console.log(_(typeDefs).uniqBy('typeName').map('typings').value().join(''))

  return jsTemplate({ className: name, methods: schema.methods, typeDefs, getTypeId });
}

const copyStatic = async (destinationDirectoryName) => {
  await fsx.ensureDir(destinationDirectoryName);
  await fsx.emptyDir(destinationDirectoryName);

  const staticPath = path.join(__dirname, '../', '/templates/js/static');
  fsx.copy(staticPath, destinationDirectoryName);
};

const bootstrapGeneratedPackage = (destinationDirectoryName) => {
  return new Promise(
    (resolve) => exec(`cd ${destinationDirectoryName} && npm install && npm run build`, resolve)
  );
};

module.exports = async ({clientName, schema}) => {
  const compiledResult = await compileTemplate(clientName, schema);

  const destinationDirectoryName = `${cwd}/${clientName}`;
  await cleanBuildDir(destinationDirectoryName);
  await copyStatic(destinationDirectoryName);
  await writeFile(`${destinationDirectoryName}/${clientName}.ts`, compiledResult, 'utf8');

  await bootstrapGeneratedPackage(destinationDirectoryName);
  return true;
};
