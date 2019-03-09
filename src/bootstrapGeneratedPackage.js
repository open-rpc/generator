module.exports = (exec) => (destinationDirectoryName) => {
  const commandSequence = [
    `cd ${destinationDirectoryName}`,
    'npm install',
    'npm run build'
  ].join(' && ');

  return new Promise((resolve, reject) => exec(commandSequence, (err, stdout) => {
    if (err) {
      reject(new Error(stdout));
    } else {
      resolve();
    }
  }));
};
