const { expect } = require('chai');
const tp = require('./helpers/test-phases');
const fx = require('./helpers/fixtures');
const { insideTeamCity } = require('./helpers/env-variables');

describe('Aggregator: Lint', () => {
  const test = tp.create();
  afterEach(() => test.teardown());

  describe('tslint', () => {
    it('should run tslint on files according to tsconfig.json', async () => {
      const res = await test
        .setup({
          'app/a.ts': `import '../not-in-glob/b';`,
          'not-in-glob/b.ts': 'parseInt("1")',
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig({ files: ['app/a.ts'] }),
          'tslint.json': fx.tslint({ radix: true }),
        })
        .spawn('lint');

      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('radix  Missing radix parameter');
      expect(res.stderr).to.contain('tslint exited with 1 error');
    });

    it('should pass with no errors', async () => {
      const res = await test
        .setup({
          'app/a.ts': `import '../not-in-glob/b';`,
          'not-in-glob/b.ts': 'parseInt("1", 10)',
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig({ files: ['app/a.ts'] }),
          'tslint.json': fx.tslint({ radix: true }),
        })
        .spawn('lint');

      expect(res.code).to.equal(0);
    });

    it('should fix linting errors and exit with exit code 0 if executed with --fix flag & there are only fixable errors', async () => {
      const res = await test
        .setup({
          'app/a.ts': `const a = "1"`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint({ semicolon: [true, 'always'] }),
        })
        .spawn('lint', ['--fix']);

      expect(res.code).to.equal(0);
      expect(test.content('app/a.ts')).to.equal(`const a = "1";`);
    });

    it('should support formatter flag', async () => {
      const res = await test
        .setup({
          'app/a.ts': `parseInt("1");`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig(),
          'tslint.json': fx.tslint({ radix: true }),
        })
        .spawn('lint', ['--format json']);

      expect(res.code).to.equal(1);
      // endPoisition is a json only parameter
      expect(res.stdout).to.contain('endPosition');
      expect(res.stdout).to.contain('Missing radix parameter');
    });

    it('should support a list of files to run lint on (not necessarily on tsconfig)', async () => {
      const res = await test
        .setup({
          'app/a.ts': `parseInt("1");`,
          'other-dir/b.tsx': `parseInt("1");`,
          'app/dontrunonme.js': `parseInt("1");`,
          'package.json': fx.packageJson(),
          'tsconfig.json': fx.tsconfig({ include: ['app/a.ts'] }),
          'tslint.json': fx.tslint({ radix: true }),
        })
        .spawn('lint', ['app/a.ts', 'other-dir/b.tsx'], insideTeamCity);

      expect(res.code).to.equal(1);
      expect(res.stdout).to.contain('app/a.ts:1:1');
      expect(res.stdout).to.contain('Missing radix parameter');
      expect(res.stdout).to.contain('other-dir/b.tsx:1:1');
      expect(res.stderr).to.contain('tslint exited with 2 errors');
    });
  });

  describe('yoshi-eslint', () => {
    function setup(data) {
      return test.setup(
        Object.assign(
          {
            'package.json': fx.packageJson(),
            '.eslintrc': fx.eslintrc(),
          },
          data,
        ),
      );
    }

    it('should use yoshi-eslint', async () => {
      const res = await setup({ 'app/a.js': `parseInt("1", 10);` }).spawn(
        'lint',
        [],
        insideTeamCity,
      );
      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', async () => {
      const res = await setup({ 'app/a.js': `parseInt("1");` }).spawn(
        'lint',
        [],
        insideTeamCity,
      );
      expect(res.code).to.equal(1);
      expect(res.stderr).to.contain(
        '1:1  error  Missing radix parameter  radix',
      );
    });

    it('should fix linting errors and exit with exit code 0 if there are only fixable errors', async () => {
      const res = await setup({
        'app/a.js':
          '/*eslint no-regex-spaces: "error"*/\nnew RegExp("foo  bar");',
      }).spawn('lint', ['--fix']);

      expect(res.code).to.equal(0);
      expect(test.content('app/a.js')).to.equal(
        '/*eslint no-regex-spaces: "error"*/\nnew RegExp("foo {2}bar");',
      );
    });

    it('should support formatter flag', async () => {
      const res = await setup({ 'app/a.js': `parseInt("1");` }).spawn(
        'lint',
        ['--format json'],
        insideTeamCity,
      );
      expect(res.code).to.equal(1);
      expect(JSON.parse(res.stderr)[0].messages[0].message).to.eq(
        'Missing radix parameter.',
      );
    });

    it('should support a list of files to run lint on', async () => {
      const res = await setup({
        'app/a.js': `parseInt("1");`,
        'app/b.js': `parseInt("1");`,
        'app/dontrunonme.js': `parseInt("1");`,
      }).spawn('lint', ['app/a.js', 'app/b.js'], insideTeamCity);

      expect(res.code).to.equal(1);
      expect(res.stderr).to.contain('app/a.js');
      expect(res.stderr).to.contain('Missing radix parameter');
      expect(res.stderr).to.contain('app/b.js');
    });
  });

  describe('yoshi-stylelint', () => {
    it('should use yoshi-stylelint', async () => {
      const goodStyle = `
p {
  $color: #ff0;
  color: #ff0;
}`;
      const res = await test
        .setup({
          'src/a.scss': goodStyle,
          'src/b.scss': goodStyle,
          'a.less': goodStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`,
        })
        .spawn('lint', []);

      expect(res.stdout).to.contain(`Starting 'stylelint'`);
      expect(res.stdout).to.contain(`Finished 'stylelint'`);
      expect(res.code).to.equal(0);
    });

    it('should fail with exit code 1', async () => {
      const badStyle = `
p {
  color: #ff0;
}



`;

      const res = await test
        .setup({
          'src/a.scss': badStyle,
          'src/b.scss': badStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`,
        })
        .spawn('lint', []);

      expect(res.stderr).to.contain('✖  Expected no more than 1 empty line');
      expect(res.stderr).to.contain('max-empty-lines');
      expect(res.code).to.equal(1);
    });

    it('should support a list of files to run stylelint on', async () => {
      const badStyle = `
p {
  color: #ff0;
}



`;
      const res = await test
        .setup({
          'src/a.less': badStyle,
          'src/b.scss': badStyle,
          'src/dontrunonme.scss': badStyle,
          'package.json': `{
            "name": "a",\n
            "version": "1.0.0",\n
            "stylelint": {
              "rules": {
                "max-empty-lines": 1
              }
            }
          }`,
        })
        .spawn('lint', ['src/a.less', 'src/b.scss']);

      expect(res.stderr).to.contain('✖  Expected no more than 1 empty line');
      expect(res.stderr).to.contain('src/a.less');
      expect(res.stderr).to.contain('src/b.scss');
      expect(res.stderr).to.not.contain('src/dontrunonme.scss');
      expect(res.code).to.equal(1);
    });
  });

  describe('Empty state', () => {
    it('should pass out of the box if no relevant files exist', async () => {
      const res = await test
        .setup({
          'package.json': fx.packageJson(),
        })
        .spawn('lint');

      expect(res.code).to.equal(0);
    });
  });

  describe('hooks', () => {
    describe('prelint', () => {
      it('should run a bash command before lint', async () => {
        const res = await test
          .setup({
            '.eslintrc': fx.eslintrc(),
            'app/a.js': `parseInt("1");`,
            'package.json': fx.packageJson({
              hooks: { prelint: 'echo "hello world" && exit 1' },
            }),
          })
          .spawn('lint', [], insideTeamCity);

        expect(res.code).to.equal(1);
        expect(res.stdout).to.contain('hello world');
        expect(res.stderr).to.not.contain('Missing radix parameter');
      });
    });
  });
});
