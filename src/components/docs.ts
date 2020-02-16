import * as path from "path";
import { move, ensureDir, remove } from "fs-extra";
import { IHooks } from "..";
import * as fs from "fs";
import { promisify } from "util";
import { template } from "lodash";
import { ContentDescriptorObject, ExamplePairingObject, ExampleObject, MethodObject } from "@open-rpc/meta-schema";
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const access = promisify(fs.access);

const onlyHandleReact = ({ language }: any) => {
  if (language !== "react") {
    throw new Error("Cannot handle any other output formats other than react TS for docs generator");
  }
};

const indexTemplate = template(`import React, { useEffect } from "react";
import { Grid, Typography, Box, Button } from "@material-ui/core";
import { Link as GatsbyLink } from "gatsby";
import Link from "@material-ui/core/Link";
import { grey } from "@material-ui/core/colors";

const MyApp: React.FC = () => {
  return (
    <>
      <Grid container alignContent="center" alignItems="center" justify="center" direction="column">
<img className="logo" alt="logo" src={"https://camo.githubusercontent.com/bc04ec4cd12a232ee902ce0c0344098ad854e80d/68747470733a2f2f6d69726f2e6d656469756d2e636f6d2f6d61782f313439322f312a337256307a30756654716b474334524a3376585177412e706e67"} style={{ paddingTop: "10%" }} />
        <br/>
        <Typography variant="h1"><%= openrpcDocument.info.title %></Typography>
        <Typography gutterBottom style={{ paddingTop: "100px", paddingBottom: "20px" }} variant="inherit">
          <%= openrpcDocument.info.description %>
        </Typography>
        <br/>
        <Button variant="contained" color="primary" href="/api-documentation">
          Plugin Documentation
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

const docsTemplate = template(`import React, { useEffect, useState } from "react";
import Documentation from "@open-rpc/docs-react";
import useDarkMode from "use-dark-mode";
import "./api-documentation.css";
import InspectorPlugin from "../docs-react-plugins";
import * as monaco from "monaco-editor";
import { Button, Grid, Typography, InputBase } from "@material-ui/core";

const ApiDocumentation: React.FC = () => {
  const darkmode = useDarkMode();
  useEffect(() => {
    const t = darkmode.value ? "vs-dark" : "vs";
    if (monaco) {
      monaco.editor.setTheme(t);
    }
    setReactJsonOptions({
      ...reactJsonOptions,
      theme: darkmode.value ? "summerfruit" : "summerfruit:inverted",
    });
  }, [darkmode.value]);

  const [reactJsonOptions, setReactJsonOptions] = useState({
    theme: "summerfruit:inverted",
    collapseStringsAfterLength: 25,
    displayDataTypes: false,
    displayObjectSize: false,
    indentWidth: 2,
    name: false,
  });

  const [snapId, setSnapId] = useState("wallet_plugin_http://localhost:8081/package.json");

  const handleConnect = () => {
    (window as any).ethereum.send({
      method: "wallet_enable",
      params: [{ [snapId]: {} }]
    });
  };

  return (
    <>
      <Grid container direction="row" justify="center" alignItems="center">
        <Typography variant="h3" style={{ marginRight: "15px" }}>snapId</Typography>
        <InputBase value={snapId} onChange={(e) => setSnapId(e.target.value)}
          style={{ background: "rgba(0,0,0,0.1)", fontSize: "20px", borderRadius: "4px", padding: "0px 10px", marginRight: "5px", width: "500px" }}
        />
        <Button onClick={handleConnect} variant="outlined" style={{fontSize: "15px"}}>Connect</Button>
      </Grid>
      <Documentation
        methodPlugins={[InspectorPlugin]}
        reactJsonOptions={reactJsonOptions}
        schema={<%= JSON.stringify(openrpcDocument) %>}
      />
    </>
  );

};

export default ApiDocumentation;
`);

const hooks: IHooks = {
  afterCopyStatic: [
    async (dest, frm, component, openrpcDocument) => {
      onlyHandleReact(component);
      const destPath = path.join(dest, "package.json");
      const tmplPath = path.join(dest, "_package.json");

      const tmplPkgStr = await readFile(tmplPath, "utf8");
      let tmplPkg = JSON.parse(tmplPkgStr);

      tmplPkg.name = component.name || openrpcDocument.info.title;
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
  afterCompileTemplate: [
    async (dest, frm, component, openrpcDocument, typings) => {
      onlyHandleReact(component);
    },
  ],
  templateFiles: {
    react: [
      {
        path: "src/pages/index.tsx",
        template: indexTemplate,
      },
      {
        path: "src/pages/api-documentation.tsx",
        template: docsTemplate,
      },
    ],
  },
};

export default hooks;
