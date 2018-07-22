# Yoshi

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Wix's toolkit to support building applications of different types.

* [Creating an App](#creating-an-app) - How to create a new app.
* [Basic Usage](#basic-usage) - How to use Yoshi.
* [User Guide](#user-guide) - How to develop apps bootstrapped with Yoshi.

If something doesnt work for you, please [file an issue](https://github.com/wix/yoshi/issues/new/choose).

## Quickstart

```sh
npx create-yoshi-app my-app
cd my-app
npm start
```

Then open [http://localhost:3000/](http://localhost:3000/) to see your app.

<p align='center'>
  <img src='https://yoshi-assets.surge.sh/create-yoshi-app.gif' alt='create-yoshi-app'>
</p>


### Get Started Immediately

You **don’t** need to install or configure tools like Webpack or Babel.<br>
They are preconfigured and hidden so that you can focus on the code.

Just create a project, and you're good to go.

## Creating an App

**You'll have to have Node >= 8.9.1 on your local developement machine**.

To create a new app, you may choose one of the following methods:

### npx
```sh
npx create-yoshi-app my-app
```
*([npx](https://medium.com/@maybekatz/introducing-npx-an-npm-package-runner-55f7d4bd282b) comes with npm 5.2+ and higher, see [instructions for older npm versions](https://gist.github.com/gaearon/4064d3c23a77c74a3614c498a8bb1c5f))*

### npm
```sh
npm init yoshi-app my-app
```
*`npm init <initializer>` is available in npm 6+*

It will create a directory called `my-app` inside the current folder.<br>
Inside that directory, it will generate the initial project structure and install the transitive dependencies.<br>
No configuration or complicated folder structures, just the files you need to build your app.<br>
Once the installation is done, you can open your project folder:
```
cd my-app
```

Inside the newly created project, you can run some built-in commands:

## Basic Usage

### `npm start`
Runs the app in development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will automatically reload if you make changes to the code.<br>
You will see the build errors and lint warnings in the console.

### `npm test`
Runs your unit and e2e tests.<br>
Run `npm test --watch` to run the tests in watch mode.<br>
See Yoshi's [CLI Documentation](/docs/faq/YOSHI-API.md#cli) for a complete list of all of Yoshi's CLI capabilities.

## User Guide
The User Guide includes information on different topics, such as:

- [How do I use Yoshi without the generator?](/docs/faq/YOSHI-API.md)
- [How do I configure Yoshi to my needs?](/docs/faq/YOSHI-API.md)
- [How do I debug my server/tests?](/docs/faq/DEBUGGING.md)
- [How to add external assets to my client part of the project?](docs/faq/ASSETS.md)
- [How to use HMR? And how to customize React project to use it?](docs/faq/USING-HMR.md)
- [How to add and use babel-preset-yoshi?](packages/babel-preset-yoshi/README.md)
- [How do I setup Enzyme test environment?](docs/faq/SETUP-TESTING-WITH-ENZYME.md)
- [How to export ES modules along with commonjs?](docs/faq/EXPORT-MODULES.md)
- [How to disable css modules in specific places](docs/faq/DISABLE-SPECIFIC-CSS-MODULES.md)
- [How to I analyze my webpack bundle contents](docs/faq/WEBPACK-ANALYZE.md)
- [How do I separately bundle common logic for multiple entries?](docs/faq/SPLIT-CHUNKS.md)
- [How to use SVG](docs/faq/SVG.md)
- [Moment.js locales are missing](docs/faq/MOMENT_OPTIMIZATION.md)
- [How do I add automatic AB tests to textual content? (Wix Specific)](docs/faq/AB_TRANSLATE.md)
