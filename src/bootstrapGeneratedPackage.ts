export type TBootstrapGeneratedPackage = (destinationDirectoryName: string, language: string) => any;

interface ILanguageCommandSequences {
  rust: string[];
  typescript: string[];
  [k: string]: string[];
}

const languageCommandSequences: ILanguageCommandSequences = {
  rust: [
    "cargo build",
    "cargo test --all",
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

  return new Promise((resolve, reject) => exec(commandSequence, (err: Error, stdout: string, stderr: string) => {
    if (err) {
      reject(new Error(stdout + stderr));
    } else {
      resolve();
    }
  }));
};
