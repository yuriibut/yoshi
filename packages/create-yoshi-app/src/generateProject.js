const fs = require('fs');
const path = require('path');
const globby = require('globby');
const mkdirp = require('mkdirp');
const replaceTemplates = require('./replaceTemplates');

module.exports = (
  {
    projectName,
    authorName,
    authorEmail,
    organization,
    projectType,
    transpiler,
  },
  workingDir,
) => {
  const typescriptSuffix = transpiler === 'typescript' ? '-typescript' : '';
  const templatePath = path.join(
    __dirname,
    '../templates',
    projectType + typescriptSuffix,
  );

  const filesPaths = globby.sync('**/*', {
    cwd: templatePath,
    dot: true,
    gitignore: true,
  });

  const valuesMap = {
    projectName,
    authorName,
    authorEmail,
    organization,
  };

  const files = {};

  filesPaths.forEach(filePath => {
    const content = fs.readFileSync(path.join(templatePath, filePath), 'utf-8');
    files[filePath] = replaceTemplates(content, valuesMap);
  });

  for (const fileName in files) {
    const fullPath = path.join(workingDir, fileName);
    mkdirp.sync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, files[fileName]);
  }
};
