const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const globby = require('globby');
const { generateProject } = require('../src');

const projectTypes = fs.readdirSync(path.join(__dirname, '../templates'));

const mockedAnswers = projectTypes.map(projectType => [
  projectType,
  {
    projectName: `test-${projectType}`,
    authorName: 'rany',
    authorEmail: 'rany@wix.com',
    organization: 'wix',
    projectType: projectType,
    transpiler: projectType.endsWith('typescript') ? 'typescript' : 'babel',
  },
]);

test.each(mockedAnswers)('%s', (testName, answers) => {
  const tempDir = tempy.directory();

  generateProject(answers, tempDir);

  const filesPaths = globby.sync('**/*', {
    cwd: tempDir,
    dot: true,
    gitignore: true,
  });

  const files = {};

  filesPaths.forEach(filePath => {
    const content = fs.readFileSync(path.join(tempDir, filePath), 'utf-8');
    files[filePath] = content;
  });

  expect(files).toMatchSnapshot();
});
