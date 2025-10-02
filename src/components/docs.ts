import * as path from 'path';
import { copy, ensureDir, remove } from 'fs-extra';
import { IHooks, IComponent } from './types';
import { IDocsExtraConfig } from 'src/config';
import * as fs from 'fs';
import { promisify } from 'util';
import { template, startCase } from 'lodash';
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const copyFile = promisify(fs.copyFile);

const indexTemplate = template(`import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { graphql, Link, useStaticQuery } from 'gatsby';
import 'monaco-editor/esm/vs/language/json/json.worker.js';

const IndexPage = () => {
  const data = useStaticQuery(graphql\`
    {
      site {
        siteMetadata {
          logoUrl
        }
      }
    }
  \`);
  // For SSR, we need a simpler version
  if (typeof window === 'undefined') {
    return (
      <Grid container alignItems="center" justifyContent="center" direction="column">
        <Typography variant="h1"><%= openrpcDocument.info.title %></Typography>
        <Typography>Loading...</Typography>
      </Grid>
    );
  }

  // For client-side rendering, we show the full content
  return (
    <Grid container alignItems="center" justifyContent="center" direction="column">
      <img
        className="logo"
        alt="logo"
        src={
          data.site.siteMetadata.logoUrl
            ? data.site.siteMetadata.logoUrl
            : 'https://raw.githubusercontent.com/open-rpc/design/master/icons/open-rpc-logo-noText/open-rpc-logo-noText%20(PNG)/256x256.png'
        }
        style={{ paddingTop: '10%' }}
      />
      <Typography variant="h1"><%= openrpcDocument.info.title %></Typography>
      <% if (openrpcDocument.info.description) { %>
      <Box sx={{ paddingTop: '20px', paddingBottom: '20px' }}>
        <Typography variant="body1"><%= openrpcDocument.info.description %></Typography>
      </Box>
      <% } %>
      <Box sx={{ paddingTop: '100px', paddingBottom: '20px' }}>
        <Button variant="contained" color="primary" component={Link} to="/api-documentation">
          API Reference Documentation
        </Button>
      </Box>
    </Grid>
  );
};

export default IndexPage;
`);

const gatsbyConfigTemplate = template(`
module.exports = {
  pathPrefix: "",
  siteMetadata: {
    title: '<%= openrpcDocument.info.title %>',
    description: '<%= openrpcDocument.info.description %>',
    siteUrl: 'https://open-rpc.org',
    logoUrl: 'https://raw.githubusercontent.com/open-rpc/design/master/icons/open-rpc-logo-noText/open-rpc-logo-noText%20(PNG)/256x256.png',
    primaryColor: '#3f51b5', //material-ui primary color
    secondaryColor: '#f50057', //material-ui secondary color
    author: '',
    menuLinks: [
      {
        name: 'home',
        link: '/',
        ignoreNextPrev: true
      },
      {
        name: 'API Documentation',
        link: '/api-documentation'
      }
    ],
    footerLinks: [
      {
        name: 'OpenRPC',
        link: 'https://open-rpc.org'
      }
    ]
  },
  plugins: [
   {
      resolve: 'gatsby-plugin-mdx',
      options: {
        extensions: ['.mdx', '.md'],
        gatsbyRemarkPlugins: [
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              icon: false,
            },
          },
        ],
      },
    },
    "gatsby-openrpc-theme",
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'pristine-site',
        short_name: 'pristine-site',
        start_url: '/',
        background_color: 'transparent',
        theme_color: '#3f51b5',
        display: 'minimal-ui',
        icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
      },
    },
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: __dirname + '/src/images',
      },
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "docs",
        path: __dirname + '/src/docs',
      },
    },
  ],
}
`);

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component, openrpcDocument): Promise<void> => {
      const replacePackageJsonContent = async (fileName: string) => {
        const destPath = path.join(dest, fileName);
        const tmplPath = path.join(dest, `_${fileName}`);

        const tmplPkgStr = await readFile(tmplPath, 'utf8');
        let tmplPkg = JSON.parse(tmplPkgStr);

        tmplPkg.name = component.name || startCase(openrpcDocument.info.title).replace(/\s/g, '');
        tmplPkg.version = openrpcDocument.info.version;

        let currPkgStr;
        try {
          currPkgStr = await readFile(destPath, 'utf8');
          const currPkg = JSON.parse(currPkgStr);
          tmplPkg = {
            ...currPkg,
            ...tmplPkg,
            dependencies: {
              ...currPkg.dependencies,
              ...tmplPkg.dependencies,
            },
            devDependencies: {
              ...currPkg.devDependencies,
              ...tmplPkg.devDependencies,
            },
          };
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // do nothing
        }

        await writeFile(destPath, JSON.stringify(tmplPkg, undefined, '  '));
        await remove(tmplPath);
      };
      await replacePackageJsonContent('package.json');
      await replacePackageJsonContent('package-lock.json');
    },
  ],
  templateFiles: {
    gatsby: [
      {
        path: 'src/pages/index.tsx',
        template: indexTemplate,
      },
      {
        path: 'gatsby-config.js',
        template: gatsbyConfigTemplate,
      },
    ],
  },
  afterCompileTemplate: [
    async (dest, frm, component, _): Promise<void> => {
      const docsComponent = component as IComponent<IDocsExtraConfig>;
      if (!docsComponent.extraConfig) {
        return;
      }
      try {
        if (docsComponent.extraConfig.docsPath) {
          await remove(path.join(dest, 'src/docs'));
          await ensureDir(path.join(dest, 'src/docs'));
          await copy(docsComponent.extraConfig.docsPath, path.join(dest, 'src/docs'));
        }
        if (docsComponent.extraConfig.gatsbyConfigPath) {
          await copyFile(
            path.join(docsComponent.extraConfig.gatsbyConfigPath, 'gatsby-config.js'),
            path.join(dest, 'gatsby-config.js')
          );
        }
        if (docsComponent.extraConfig.staticPath) {
          await remove(path.join(dest, 'static'));
          await ensureDir(path.join(dest, 'static'));
          await copy(docsComponent.extraConfig.staticPath, path.join(dest, 'static'));
        }
      } catch (error) {
        throw new Error(`Error with extraDocsConfig: ${error}`);
      }
    },
  ],
};

export default hooks;
