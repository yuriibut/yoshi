const fs = require('fs');
const path = require('path');
const { envs } = require('./constants');

module.exports = {
  globalSetup: require.resolve('jest-environment-yoshi-puppeteer/globalSetup'),
  globalTeardown: require.resolve(
    'jest-environment-yoshi-puppeteer/globalTeardown',
  ),
  projects: [
    ...[
      {
        displayName: 'component',
        testEnvironment: 'jsdom',
        testURL: 'http://localhost:5554',
        testMatch: ['<rootDir>/src/**/*.spec.*'],
      },
      {
        displayName: 'server',
        testEnvironment: require.resolve('jest-environment-yoshi-bootstrap'),
        testMatch: ['<rootDir>/test/it/**/*.spec.*'],
      },
      {
        displayName: 'e2e',
        testEnvironment: require.resolve('jest-environment-yoshi-puppeteer'),
        testMatch: ['<rootDir>/test/e2e/**/*.e2e.*'],
      },
    ]
      .filter(({ displayName }) => {
        if (envs) {
          return envs.includes(displayName);
        }

        return true;
      })
      .map(project => {
        const setupTestsPath = path.resolve(
          process.cwd(),
          `test/setup.${project.displayName}.ts`,
        );

        const setupTestsFile = fs.existsSync(setupTestsPath)
          ? `<rootDir>/test/setup.${project.displayName}.ts`
          : undefined;

        return {
          ...project,

          transformIgnorePatterns: ['/node_modules/(?!(.*?\\.st\\.css$))'],

          transform: {
            '^.+\\.(js)$': require.resolve('babel-jest'),
            '^.+\\.tsx?$': require.resolve('ts-jest'),
            '\\.st.css?$': require.resolve('./transforms/stylable'),
          },

          moduleNameMapper: {
            '^.+\\.(sass|scss)$': require.resolve('identity-obj-proxy'),
            '\\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|otf|eot|wav|mp3)$': require.resolve(
              './transforms/file',
            ),
          },

          setupTestFrameworkScriptFile: setupTestsFile,

          moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
        };
      }),
    // workaround for https://github.com/facebook/jest/issues/5866
    {
      displayName: 'dummy',
      testMatch: ['dummy'],
    },
  ],
};
