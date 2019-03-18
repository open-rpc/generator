export type TBootstrapGeneratedPackage = (destinationDirectoryName: string) => any;

export default (exec: any): TBootstrapGeneratedPackage => (destinationDirectoryName: string) => {
  const commandSequence = [
    `cd ${destinationDirectoryName}`,
    "npm install",
    "npm run lint",
    "npm run build",
  ].join(" && ");

  return new Promise((resolve, reject) => exec(commandSequence, (err: Error, stdout: string) => {
    if (err) {
      reject(new Error(stdout));
    } else {
      resolve();
    }
  }));
};
