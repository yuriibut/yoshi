const fs = require('fs');
const path = require('path');
const tempy = require('tempy');
const expect = require('expect');
const execa = require('execa');

const projectTypes = fs
  .readdirSync(path.join(__dirname, '../packages/create-yoshi-app/templates'))
  .filter(projectType => projectType === 'client');

const { generateProject } = require('../packages/create-yoshi-app/src/index');

const testTemplate = mockedAnswers => {
  describe(`${mockedAnswers.projectType}`, () => {
    const tempDir = tempy.directory();

    it(`should create the project`, async () => {
      await generateProject(mockedAnswers, tempDir);
      expect(fs.readdirSync(tempDir).length).toBeGreaterThan(0);
    });

    it(`should run npm install`, () => {
      console.log('running npm install');
      execa.shellSync('npm install', {
        cwd: tempDir,
        stdio: 'inherit',
      });
    });

    it(`should run npm test`, () => {
      console.log('running npm test');
      execa.shellSync('npm test', { cwd: tempDir, stdio: 'inherit' });
    });
  });
};

describe('create-yoshi-app + yoshi e2e tests', () => {
  projectTypes
    .map(projectType => ({
      projectName: `test-${projectType}`,
      authorName: 'foo',
      authorEmail: 'foo@wix.com',
      organization: 'wix',
      projectType: projectType,
      transpiler: projectType.endsWith('typescript') ? 'typescript' : 'babel',
    }))
    .forEach(testTemplate);
});
