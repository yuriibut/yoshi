#!/usr/bin/env node
const prog = require('caporal');
const Insight = require('insight');
const createRunCLI = require('../src/cli');
const pkg = require('../package');
const { inTeamCity } = require('../src/utils');

const { BOOL, INT } = prog;
const infoCommand = require('../src/commands/info');

// IDEs start debugging with '--inspect' or '--inspect-brk' option. We are setting --debug instead
require('./normalize-debugging-args')();

const insight = new Insight({
  trackingCode: 'xxx',
  pkg,
});

if (inTeamCity()) {
  insight.optOut = true;
}

const runCLI = createRunCLI(insight);

prog
  .version(pkg.version)
  .description('A toolkit for building applications in Wix');

prog
  .command('lint', 'Run the linter')
  .option('--fix', 'Automatically fix lint problems')
  .option('--format', 'Use a specific formatter for eslint/tslint')
  .argument('[files...]', 'Run lint on a list of files')
  .action(() => runCLI('lint'));

prog
  .command('test', 'Run unit tests and e2e tests if exists')
  .option('--mocha', 'Run unit tests with Mocha', BOOL)
  .option('--jasmine', 'Run unit tests with Jasmine', BOOL)
  .option('--karma', 'Run unit tests with Karma', BOOL)
  .option('--jest', 'Run tests with Jest', BOOL)
  .option('--protractor', 'Run e2e tests with Protractor', BOOL)
  .option('--debug', 'Allow test debugging', INT)
  .option('--coverage', 'Collect and output code coverage', BOOL)
  .option(
    '--debug-brk',
    "Allow test debugging, process won't start until debugger will be attached",
    INT,
  )
  .option(
    '-w, --watch',
    'Run tests on watch mode (mocha, jasmine, jest, karma)',
    BOOL,
  )
  .action(() => runCLI('test'));

prog
  .command('build', 'Build the app for production')
  .option(
    '--output',
    'The output directory for static assets',
    /\w+/,
    'statics',
  )
  .option('--analyze', 'Run webpack-bundle-analyzer plugin', BOOL)
  .action(() => runCLI('build'));

prog
  .command('start', 'Run the app in development mode (also spawns npm test)')
  .option(
    '-e, --entry-point',
    'Entry point for the app',
    /\w+/,
    './dist/index.js',
  )
  .option(
    '--manual-restart',
    'Get SIGHUP on change and manage application reboot manually',
    BOOL,
    'false',
  )
  .option('--no-test', 'Do not spawn npm test after start', BOOL, 'false')
  .option('--no-server', 'Do not spawn the app server', BOOL, 'false')
  .option('--debug', 'Allow app-server debugging', INT)
  .option(
    '--debug-brk',
    "Allow app-server debugging, process won't start until debugger will be attached",
    INT,
  )
  .option('--ssl', 'Serve the app bundle on https', BOOL, 'false')
  .action(() => runCLI('start'));

prog
  .command('release', 'publish the package, should be used by CI')
  .action(() => runCLI('release'));

prog
  .command('info', 'Get your local environment information')
  .action(infoCommand);

// Ask for permission the first time
if (insight.optOut === undefined) {
  insight.askPermission(null, () => {
    prog.parse(process.argv);
  });
} else {
  prog.parse(process.argv);
}

process.on('unhandledRejection', error => {
  insight.trackEvent({
    category: 'error',
    action: 'error',
    error,
  });

  throw error;
});
