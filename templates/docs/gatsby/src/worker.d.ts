declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module 'monaco-editor/esm/vs/*?worker&url' {
  const url: string;
  export default url;
}

declare module 'monaco-editor/esm/vs/editor/editor.worker?worker' {
  const worker: new () => Worker;
  export default worker;
}

declare module 'monaco-editor/esm/vs/language/json/json.worker?worker' {
  const worker: new () => Worker;
  export default worker;
}
