const fs = require('fs');
const path = require('path');
const glob = require('glob');
const CLIEngine = require('eslint').CLIEngine;
const eslintConfigYoshiBase = require('../index');

var eslintCli = new CLIEngine(eslintConfigYoshiBase);

describe('eslint-config-yoshi-base', () => {
  describe('rules', () => {
    const rulesDir = path.resolve(__dirname, './rules');
    // const rules = fs.readdirSync(rulesDir);
    const rules = ['array-callback-return'];
    rules.forEach(rule => {
      describe(rule, () => {
        const ruleDir = path.join(rulesDir, rule);
        const validFiles = glob.sync(path.join(ruleDir, 'valid*.js'));
        const invalidFiles = glob.sync(path.join(ruleDir, 'invalid*.js'));
        const warningFiles = glob.sync(path.join(ruleDir, 'warn*.js'));

        validFiles.forEach(validFile => {
          it(`should be valid for ${path.basename(validFile)}`, () => {
            const results = eslintCli.executeOnFiles([validFile]);
            if (results.errorCount !== 0) {
              throw new Error(
                `the following file had errors\n ${JSON.stringify(
                  results,
                  null,
                  2,
                )}
              `,
              );
            }

            if (results.warningCount !== 0) {
              throw new Error(
                `the following file had warnings\n ${JSON.stringify(
                  results,
                  null,
                  2,
                )}
              `,
              );
            }
          });
        });

        invalidFiles.forEach(invalidFile => {
          it(`should be invalid for ${path.basename(invalidFile)}`, () => {
            const results = eslintCli.executeOnFiles([invalidFile]);

            if (results.errorCount === 0) {
              throw new Error(
                `the following file should have errors\n ${JSON.stringify(
                  results,
                  null,
                  2,
                )}
            `,
              );
            }
          });
        });

        warningFiles.forEach(warningFile => {
          it(`should raise warnings for ${path.basename(warningFile)}`, () => {
            const results = eslintCli.executeOnFiles([warningFile]);

            if (results.warningCount === 0) {
              throw new Error(
                `the following file should have warnings\n ${JSON.stringify(
                  results,
                  null,
                  2,
                )}
            `,
              );
            }
          });
        });
      });
    });
  });
});
