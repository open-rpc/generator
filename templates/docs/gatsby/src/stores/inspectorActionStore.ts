import { createStore } from 'reusable';
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default createStore((): any => {
  const [inspectorContents, setInspectorContents] = useState();
  return [inspectorContents, setInspectorContents];
});
