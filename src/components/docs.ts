import * as path from "path";
import { remove } from "fs-extra";
import { IHooks } from "./types";
import * as fs from "fs";
import { promisify } from "util";
import { template, startCase } from "lodash";
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const indexTemplate = template(`import React, { useEffect } from "react";
import { Grid, Typography, Box, Button } from "@material-ui/core";
import { Link as GatsbyLink } from "gatsby";
import Link from "@material-ui/core/Link";
import { grey } from "@material-ui/core/colors";

const MyApp: React.FC = () => {
  return (
    <>
      <Grid container alignContent="center" alignItems="center" justify="center" direction="column">
        <img className="logo" alt="logo" src={"https://raw.githubusercontent.com/open-rpc/design/master/icons/open-rpc-logo-noText/open-rpc-logo-noText%20(PNG)/256x256.png"} style={{ paddingTop: "10%" }} />
        <br/>
        <Typography variant="h1"><%= openrpcDocument.info.title %></Typography>
        <Typography gutterBottom style={{ paddingTop: "100px", paddingBottom: "20px" }} variant="inherit">
          <%= openrpcDocument.info.description %>
        </Typography>
        <br/>
        <Button variant="contained" color="primary" href="/api-documentation">
          API Reference Documentation
        </Button>
        <br />
        <br />
        <br />
      </Grid>
    </>
  );
};

export default MyApp;
`);

const gatsbyConfigTemplate = template(`
module.exports = {
  pathPrefix: "",
  siteMetadata: {
    title: '<%= openrpcDocument.info.title %>',
    description: '<%= openrpcDocument.info.description %>',
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
    "@xops.net/gatsby-openrpc-theme",
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
    }
  ],
}
`);

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component, openrpcDocument): Promise<void> => {
      const destPath = path.join(dest, "package.json");
      const tmplPath = path.join(dest, "_package.json");

      const tmplPkgStr = await readFile(tmplPath, "utf8");
      let tmplPkg = JSON.parse(tmplPkgStr);

      tmplPkg.name = component.name || startCase(openrpcDocument.info.title).replace(/\s/g, "");
      tmplPkg.version = openrpcDocument.info.version;

      let currPkgStr;
      try {
        currPkgStr = await readFile(destPath, "utf8");
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
      } catch (e) {
        // do nothing
      }

      await writeFile(destPath, JSON.stringify(tmplPkg, undefined, "  "));
      await remove(tmplPath);
    },
  ],
  templateFiles: {
    gatsby: [
      {
        path: "src/pages/index.tsx",
        template: indexTemplate,
      },
      {
        path: "gatsby-config.js",
        template: gatsbyConfigTemplate,
      },
    ],
  },
};

export default hooks;
