import { createStore } from "reusable";
import { useState } from "react";

export default createStore(() => {
  const [inspectorContents, setInspectorContents] = useState();
  return [inspectorContents, setInspectorContents];
});
