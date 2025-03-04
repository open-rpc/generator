/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const fs = require("fs");
/*
import fs from 'fs';
import MonacoWebpackPlugin from 'monaco-editor-webpack-plugin';
import path from 'path';
import webpack from 'webpack';
*/

const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

// get OpenRPC Document at build time
const resultData = fs.readFileSync(__dirname + "/src/openrpc.json").toString();

exports.sourceNodes = async ({
  actions: { createNode },
  createContentDigest,
}) => {
  // deref doc
  const openrpcDocument = JSON.parse(resultData);
  // create node for build time openrpc document on the site
  createNode({
    openrpcDocument: resultData,
    // required fields
    id: `openrpcDocument`,
    parent: null,
    children: [],
    internal: {
      type: `OpenrpcDocument`,
      contentDigest: createContentDigest(resultData),
    },
  })
}

exports.onCreateNode = ({ node, actions }) => {
  // Add logging to track node creation
  if (node.internal.type === 'OpenrpcDocument') {
    console.log('✅ Successfully created OpenRPC document node');
  }
};

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
  getConfig,
}) => {
  console.log(`Webpack build stage: ${stage}`);
  
  // Add Node.js polyfills for all build stages
  actions.setWebpackConfig({
    resolve: {
      fallback: {
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url/"),
        util: require.resolve("util/"),
        fs: false,
        path: false,
        os: false,
        process: require.resolve("process/browser"), // Add process polyfill
        buffer: require.resolve("buffer/"),
      },
    },
    plugins: [
      // Use ProvidePlugin instead of DefinePlugin for process
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),   
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  });
  
  // Handle client-side bundling
  if (stage === "develop" || stage === "build-javascript") {
    actions.setWebpackConfig({
      plugins: [
        new MonacoWebpackPlugin({
          languages: ["json"],
          filename: "[name].worker.js",
        }),
      ],
    });
  }
  
  // Handle SSR bundling
  if (stage === "build-html" || stage === "develop-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /@open-rpc\/monaco-editor-react|monaco-editor|@open-rpc\/docs-react|@open-rpc\/inspector|react-json-view|monaco-vim/,
            use: loaders.null(),
          },
        ],
      },
    });
  }
  
  // Add this at the end to debug webpack config
  const config = getConfig();
  config.stats = 'verbose';
  actions.replaceWebpackConfig(config);
}

exports.onCreatePage = ({ page, actions }) => {
  const { createPage } = actions;
  
  // List of pages that should be client-side only
  const clientOnlyPaths = ['/api-documentation/'];
  
  if (clientOnlyPaths.includes(page.path)) {
    page.context.disableSSR = true;
    createPage(page);
    console.log(`Disabled SSR for page: ${page.path}`);
  }
};