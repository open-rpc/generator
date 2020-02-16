import React, { useEffect, useState } from "react";
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
        schema={{"openrpc":"1.2.4","info":{"title":"MySnap","version":"1.0.0"},"methods":[{"name":"hello","params":[],"result":{"name":"helloWorldResult","schema":{"type":"string"}}}]}}
      />
    </>
  );

};

export default ApiDocumentation;
