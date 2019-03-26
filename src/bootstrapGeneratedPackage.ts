export type TBootstrapGeneratedPackage = (destinationDirectoryName: string, language: string) => any;

interface ILanguageCommandSequences {
  rust: string[];
  typescript: string[];
  [k: string]: string[];
}

const languageCommandSequences: ILanguageCommandSequences = {
  rust: [
    "cargo build",
  ],
  typescript: [
    "npm install",
    "npm run lint",
    "npm run build",
  ],
};

export default (exec: any): TBootstrapGeneratedPackage => (destinationDirectoryName: string, language: string) => {

  const commandSequence = [
    `cd ${destinationDirectoryName}`,
    ...languageCommandSequences[language],
  ].join(" && ");

  return new Promise((resolve, reject) => exec(commandSequence, (err: Error, stdout: string, stdErr: string) => {
    console.log(stdout, stdErr);
    if (err) {
      reject(new Error(stdout));
    } else {
      resolve();
    }
  }));
};
