#!/usr/bin/env node

const { compile } = require('nexe');
const getVersion = require('./get-version');

const releasePath = './releases/download/';
const artifactName = `openrpc-${getVersion}`;

compile({ 
  input: './bin/cli.js',
  output: `${releasePath}${getVersion}/${artifactName}`,
  name: artifactName,
})
.then(() => console.log(`Ready! ${artifactName}`));
