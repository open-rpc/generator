import React, { useEffect, useState } from "react";
import { useStaticQuery, graphql } from "gatsby";
import Documentation from "@open-rpc/docs-react";
import useDarkMode from "use-dark-mode";
import "./api-documentation.css";
import InspectorPlugin from "../docs-react-plugins";
import Inspector from "@open-rpc/inspector";
import * as monaco from "monaco-editor";
import { Button, Grid, Typography, InputBase, Container, Tab, Tabs, IconButton, Tooltip } from "@material-ui/core";
import ExpandMore from "@material-ui/icons/ExpandMore";
import ExpandLess from "@material-ui/icons/ExpandLess";
import PlaygroundSplitPane from "../components/PlaygroundSplitPane";
const $RefParser = require("json-schema-ref-parser"); //tslint:disable-line
import { useTheme } from "@material-ui/core/styles";
import useInspectorActionStore from "../stores/inspectorActionStore";


const ApiDocumentation: React.FC = () => {
  const currentTheme = useTheme();
  const [horizontalSplit, setHorizontalSplit] = useState(false);
  const [inspectorContents] = useInspectorActionStore();

  useEffect(() => {
    if (inspectorContents) {
      setHorizontalSplit(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inspectorContents]);

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

  const openrpcQueryData = useStaticQuery(graphql`
    query {
      openrpcDocument {
        id
        openrpcDocument
      }
    }
  `);
  const [openrpcDocument, setOpenrpcDocument] = useState();

  useEffect(() => {
    if (openrpcQueryData.openrpcDocument) {
      $RefParser.dereference(JSON.parse(openrpcQueryData.openrpcDocument.openrpcDocument)).then(setOpenrpcDocument);
    }
  }, [openrpcQueryData])


  return (
    <PlaygroundSplitPane
      direction="horizontal"
      split={horizontalSplit}
      splitLeft={true}
      leftStyle={{
        paddingTop: "64px",
        width: "100%",
        height: "100%",
        overflowY: "auto",
      }}
      rightStyle={{
        width: "100%",
        height: "100%",
      }}
      right={
        <Inspector
          hideToggleTheme={true}
          openrpcDocument={openrpcDocument}
          darkMode={darkmode.value}
          request={inspectorContents && inspectorContents.request}
        />
      }
      left={
        <>
          <Container>
            <Documentation
              methodPlugins={[InspectorPlugin]}
              reactJsonOptions={reactJsonOptions}
              schema={openrpcDocument || {} as any}
            />
            <div style={{ marginBottom: "20px" }} />
          </Container>
          <Tabs
            variant="scrollable"
            indicatorColor="primary"
            value={0}
            style={{ position: "absolute", bottom: "0", right: "25px", zIndex: 1, marginBottom: "0px" }}
          >
            <Tab
              onClick={() => setHorizontalSplit(!horizontalSplit)}
              style={{
                background: currentTheme.palette.background.default,
                width: "165px",
                paddingRight: "30px",
                border: `1px solid ${currentTheme.palette.text.hint}`,
              }}
              label={
                <div>
                  <Typography
                    variant="body1"><span role="img" aria-label="inspector">🕵️‍♂️</span>️ Inspector</Typography>
                  <Tooltip title="Toggle Inspector">
                    <IconButton style={{ position: "absolute", right: "5px", top: "20%" }} size="small">
                      {horizontalSplit
                        ? <ExpandMore />
                        : <ExpandLess />
                      }
                    </IconButton>
                  </Tooltip>
                </div>
              }>
            </Tab>
          </Tabs>
        </>
      }>
    </PlaygroundSplitPane>
  );

};

export default ApiDocumentation;
