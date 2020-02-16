import React from "react";
import Inspector from "@xops.net/inspector-snaps";
import { Grid } from "@material-ui/core";
import { IMethodPluginProps } from "@open-rpc/docs-react/build/Methods/Methods";

const InspectorPlugin: React.FC<IMethodPluginProps> = (props) => {
  const method = props.openrpcMethodObject;
  const examplePosition = 0;
  let example;
  let exampleParams;
  if (method && method.examples && method.examples[examplePosition]) {
    example = method.examples[examplePosition] as any;
    exampleParams = (example.params as any[]).map((p) => p.value);
  }
  return (
    <Grid style={{ height: "300px", width: "100%", overflowY: "hidden", position: "relative" }}>
      <Inspector
        snapId="wallet_plugin_http://localhost:8081/package.json"
        ethereum={window ? window.ethereum : {}}
        request={{ method: method.name, params: exampleParams || [] }}
        openrpcMethodObject={method}
        hideToggleTheme={true}
      />
    </Grid>
  );
};

export default InspectorPlugin;
