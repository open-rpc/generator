import * as React from 'react';
import { ReactNode, useEffect, useRef } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelGroupHandle,
} from 'react-resizable-panels';
import './PlaygroundSplitPane.css';

interface IProps {
  showInspector?: boolean;
  editorAndDocumentationSplit?: boolean;
  inspectorComponent?: ReactNode;
  editorComponent?: ReactNode;
  documentationComponent?: ReactNode;
  inspectorTabComponent?: ReactNode;
}

const PlaygroundSplitPane: React.FC<IProps> = ({
  showInspector = false,
  inspectorComponent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editorComponent,
  documentationComponent,
  editorAndDocumentationSplit = false,
  inspectorTabComponent,
}: IProps) => {
  const containerHorizontalPanelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const containerVerticalPanelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  // Single effect to handle all layout changes with proper error handling
  useEffect(() => {
    // Small timeout to ensure refs are available and panels are mounted
    const timer = setTimeout(() => {
      try {
        // Set horizontal layout
        if (containerHorizontalPanelGroupRef.current) {
          if (editorAndDocumentationSplit) {
            containerHorizontalPanelGroupRef.current.setLayout([50, 50]);
          } else {
            containerHorizontalPanelGroupRef.current.setLayout([0, 100]);
          }
        }

        // Set vertical layout
        if (containerVerticalPanelGroupRef.current) {
          if (showInspector) {
            containerVerticalPanelGroupRef.current.setLayout([50, 50]);
          } else {
            containerVerticalPanelGroupRef.current.setLayout([100, 0]);
          }
        }
      } catch (error) {
        // In test environments, this error can be safely ignored
        console.error('Error setting panel layouts:', error);
      }
    }, 0); // Slightly longer timeout to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [showInspector, editorAndDocumentationSplit]);

  // Calculate initial layouts for defaultSize props
  const initialHorizontalLayout = [0, 100];
  const initialVerticalLayout = showInspector ? [50, 50] : [100, 0];

  return (
    <PanelGroup direction="vertical" ref={containerVerticalPanelGroupRef}>
      <Panel defaultSize={initialVerticalLayout[0]}>
        <PanelGroup
          ref={containerHorizontalPanelGroupRef}
          direction="horizontal"
          style={{
            height: '100%',
            width: '100%',
            paddingTop: '64px',
            display: 'flex',
            overflowY: 'auto',
          }}
        >
          <Panel
            defaultSize={initialHorizontalLayout[0]}
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            <></>
          </Panel>
          <PanelResizeHandle className="resize-handle" />
          <Panel
            defaultSize={initialHorizontalLayout[1]}
            style={{
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
              minHeight: 0,
              position: 'relative',
            }}
          >
            {documentationComponent}
          </Panel>
        </PanelGroup>
      </Panel>
      <PanelResizeHandle className="resize-handle" style={{ position: 'relative' }}>
        {inspectorTabComponent}
      </PanelResizeHandle>
      <Panel defaultSize={initialVerticalLayout[1]}>
        <div
          style={{
            height: '100%',
            width: '100%',
            paddingBottom: '58px',
            overflowY: 'auto',
          }}
        >
          {inspectorComponent}
        </div>
      </Panel>
    </PanelGroup>
  );
};

export default PlaygroundSplitPane;
