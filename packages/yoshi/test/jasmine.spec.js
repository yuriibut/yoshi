const expect = require('chai').expect;
const retryPromise = require('retry-promise').default;
const psTree = require('ps-tree');
const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const {
  outsideTeamCity,
  insideTeamCity,
  insideWatchMode,
} = require('./helpers/env-variables');

describe('test --jasmine', () => {
  let test, child;

  beforeEach(() => {
    test = tp.create(outsideTeamCity);
  });

  afterEach(() => {
    const pid = child && child.pid;
    child = null;
    test.teardown();
    return killSpawnProcessAndHidChildren(pid);
  });

  it('should pass with exit code 0', async () => {
    const res = await test.setup(passingProject()).spawn('test', ['--jasmine']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('1 spec, 0 failures');
  });

  it('should pass with exit code 1', async () => {
    const res = await test.setup(failingProject()).spawn('test', ['--jasmine']);

    expect(res.code).to.equal(1);
    expect(res.stdout).to.contain('1 spec, 1 failure');
  });

  it('should not transpile tests if `transpileTests` is `false`', async () => {
    const res = await test
      .setup({
        'test/bar.js': 'export default 5;',
        'test/some.spec.js': `import foo from './bar';`,
        'package.json': fx.packageJson({ transpileTests: false }),
        '.babelrc': JSON.stringify({ presets: ['yoshi'] }),
      })
      .spawn('test', ['--jasmine']);

    expect(res.code).to.equal(1);
    expect(res.stderr).to.contain('Unexpected token import');
  });

  it('should output test coverage when --coverage is passed', async () => {
    const res = await test
      .setup(passingProject())
      .verbose()
      .spawn('test', ['--jasmine', '--coverage']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain(
      'File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |',
    );
  });

  it('should consider custom globs if configured', async () => {
    const res = await test
      .setup({
        'some/other.glob.js': `it("should pass", () => 1);`,
        'package.json': fx.packageJson({
          specs: {
            node: 'some/*.glob.js',
          },
        }),
      })
      .spawn('test', ['--jasmine']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('1 spec, 0 failures');
  });

  it('should use the right reporter when running inside TeamCity', async () => {
    const res = await test
      .setup(passingProject())
      .spawn('test', ['--jasmine'], insideTeamCity);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain(
      "##teamcity[progressStart 'Running Jasmine Tests']",
    );
  });

  it('should rerun tests after file changes when in watch mode', () => {
    child = test
      .setup(failingProject())
      .spawn('test', ['--jasmine'], insideWatchMode);

    return checkStdoutContains(test, '1 spec, 1 failure')
      .then(() => test.modify('test/a.spec.js', passingTest()))
      .then(() => checkStdoutContains(test, '2 specs, 1 failure'));
  });

  it('should run tests in typescript', async () => {
    const res = await test
      .setup({
        'tsconfig.json': fx.tsconfig(),
        'test/some.spec.ts': `declare var it: any; it("pass", () => 1);`,
        'package.json': fx.packageJson(),
      })
      .spawn('test', ['--jasmine']);

    expect(res.code).to.equal(0);
  });

  it('should load helpers', async () => {
    const res = await test
      .setup(passingProjectWithHelper())
      .spawn('test', ['--jasmine']);

    expect(res.code).to.equal(0);
    expect(res.stdout).to.contain('1 spec, 0 failures');
    expect(res.stdout).to.contain('a helper file was loaded');
  });

  it('should use "test/jasmine.json" to configure jasmine if exist', async () => {
    const res = await test
      .setup({
        'test/some.spec.js': passingTest(),
        'different/some.spec.js': failingTest(),
        'test/jasmine.json': JSON.stringify({
          // when yoshi respects the config, it will look at the "different" directory and fail
          spec_dir: 'different',
          spec_files: ['different/**/*.spec.js'],
        }),
        'package.json': fx.packageJson(),
      })
      .spawn('test', ['--jasmine']);

    expect(res.code).to.equal(1);
    expect(res.stdout).to.not.contain('1 spec, 0 failures');
  });
});

function passingProject() {
  return {
    'test/some.spec.js': passingTest(),
    'package.json': fx.packageJson(),
  };
}

function failingProject() {
  return {
    'test/some.spec.js': failingTest(),
    'package.json': fx.packageJson(),
  };
}

function passingProjectWithHelper() {
  return {
    'test/some.spec.js': passingTestWithHelper(),
    'test/setup.js': jasmineSetup(),
    'package.json': fx.packageJson(),
  };
}

function passingTest() {
  return `it('should pass', () => expect(1).toBe(1));`;
}

function failingTest() {
  return `it('should fail', () => expect(1).toBe(2));`;
}

function passingTestWithHelper() {
  return `it('should pass if helper called', function () {expect(this.helperLoaded).toBe(true)})`;
}

function jasmineSetup() {
  return "console.log('a helper file was loaded'); beforeEach(function() {this.helperLoaded = true})";
}

function checkStdoutContains(test, str) {
  return retryPromise(
    { backoff: 100 },
    () =>
      test.stdout.indexOf(str) > -1 ? Promise.resolve() : Promise.reject(),
  );
}

function killSpawnProcessAndHidChildren(pid) {
  if (!pid) {
    return Promise.resolve();
  }

  return new Promise(resolve => {
    psTree(pid, (err /*eslint handle-callback-err: 0*/, children) => {
      [pid].concat(children.map(p => p.PID)).forEach(tpid => {
        try {
          process.kill(tpid, 'SIGKILL');
        } catch (e) {}
      });
      resolve();
    });
  });
}
