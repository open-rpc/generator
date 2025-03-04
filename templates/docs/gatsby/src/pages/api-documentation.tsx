import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import { Documentation } from '@open-rpc/docs-react';
import './api-documentation.css';
import InspectorPlugin from '../docs-react-plugins';
import { Inspector } from '@open-rpc/inspector';
import * as monaco from 'monaco-editor';
import { Container, Tab, Tabs, IconButton, Tooltip, Typography } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import PlaygroundSplitPane from '../components/PlaygroundSplitPane';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { useTheme } from '@mui/material/styles';
import useInspectorActionStore from '../stores/inspectorActionStore';
import { lightTheme as reactJsonLightTheme } from '@uiw/react-json-view/light';
import { vscodeTheme as reactJsonDarkTheme } from '@uiw/react-json-view/vscode';
import { OpenrpcDocument } from '@open-rpc/meta-schema';
import { TTransport } from '@open-rpc/inspector/dist/hooks/useTransport';

const ApiDocumentationContent: React.FC = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  const currentTheme = useTheme();
  const [horizontalSplit, setHorizontalSplit] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [inspectorContents] = useInspectorActionStore<any>();

  useEffect(() => {
    if (inspectorContents) {
      setHorizontalSplit(true);
    }
  }, [inspectorContents]);

  useEffect(() => {
    const t = currentTheme.palette.mode === 'dark' ? 'vs-dark' : 'vs';
    if (monaco) {
      monaco.editor.setTheme(t);
    }
    setReactJsonOptions({
      ...reactJsonOptions,
      style: currentTheme.palette.mode === 'dark' ? reactJsonDarkTheme : reactJsonLightTheme,
    });
  }, [currentTheme]);

  const [reactJsonOptions, setReactJsonOptions] = useState({
    style: reactJsonDarkTheme,
    shortenTextAfterLength: 25,
    displayDataTypes: false,
    displayObjectSize: false,
    indentWidth: 2,
  });

  const openrpcQueryData = useStaticQuery(graphql`
    query {
      openrpcDocument {
        id
        openrpcDocument
      }
    }
  `);

  const [openrpcDocument, setOpenrpcDocument] = useState<OpenrpcDocument>();
  const [inspectorUrl, setInspectorUrl] = useState<string>();
  const [inspectorTransport, setInspectorTransport] = useState<string>();

  useEffect(() => {
    if (openrpcQueryData.openrpcDocument) {
      try {
        // First parse the string to JSON
        const parsedJson = JSON.parse(openrpcQueryData.openrpcDocument.openrpcDocument);
        // Then dereference it
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ($RefParser.dereference(parsedJson) as any)
          .then(setOpenrpcDocument)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .catch((err: any) => {
            console.error('Error dereferencing schema:', err);
            // Fallback to using the non-dereferenced schema
            setOpenrpcDocument(parsedJson);
          });
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    }
  }, [openrpcQueryData]);

  useEffect(() => {
    if (!openrpcDocument) {
      return;
    }
    if (openrpcDocument.servers && openrpcDocument.servers[0]) {
      setInspectorUrl(openrpcDocument.servers[0].url);
      if (openrpcDocument.servers[0]['x-transport']) {
        setInspectorTransport(openrpcDocument.servers[0]['x-transport']);
      }
    }
  }, [openrpcDocument]);

  return (
    <PlaygroundSplitPane
      showInspector={horizontalSplit}
      editorComponent={<></>}
      inspectorComponent={
        <Inspector
          url={inspectorUrl}
          transport={inspectorTransport as TTransport}
          hideToggleTheme={true}
          openrpcDocument={openrpcDocument}
          darkMode={currentTheme.palette.mode === 'dark'}
          request={inspectorContents && inspectorContents.request}
        />
      }
      documentationComponent={
        <Container>
          <Documentation
            methodPlugins={[InspectorPlugin]}
            reactJsonOptions={reactJsonOptions}
            uiSchema={{
              params: {
                'ui:defaultExpanded': false,
              },
              extensions: {
                'ui:hidden': true,
              },
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            schema={openrpcDocument || ({} as any)}
          />
          <div style={{ marginBottom: '20px' }} />
        </Container>
      }
      inspectorTabComponent={
        <Tabs
          variant="scrollable"
          indicatorColor="primary"
          value={0}
          style={{
            position: 'absolute',
            bottom: '0',
            right: '25px',
            zIndex: 1,
            marginBottom: '0px',
          }}
        >
          <Tab
            onClick={() => setHorizontalSplit(!horizontalSplit)}
            style={{
              background: currentTheme.palette.background.default,
              width: '165px',
              paddingRight: '30px',
              border: `1px solid ${currentTheme.palette.text.primary}`,
            }}
            label={
              <div>
                <Typography variant="body1">
                  <span role="img" aria-label="inspector">
                    🕵️‍♂️
                  </span>
                  ️ Inspector
                </Typography>
                <Tooltip title="Toggle Inspector">
                  <IconButton
                    component="div"
                    style={{ position: 'absolute', right: '5px', top: '20%' }}
                    size="small"
                  >
                    {horizontalSplit ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                </Tooltip>
              </div>
            }
          ></Tab>
        </Tabs>
      }
    />
  );
};

const ApiDocumentation: React.FC = () => {
  if (typeof window === 'undefined') {
    return (
      <>
        <Typography variant="h1">API Documentation</Typography>
        <Typography>Loading documentation...</Typography>
      </>
    );
  }

  return <ApiDocumentationContent />;
};

export default ApiDocumentation;
