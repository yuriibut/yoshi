const path = require('path');
const testkit = require('wix-bootstrap-testkit');
const configEmitter = require('wix-config-emitter');
const rpcTestkit = require('wix-rpc-testkit');
const NodeEnvironment = require('jest-environment-node');
const project = require('yoshi/config/project');
const {
  PORT,
  MANAGEMENT_PORT,
  RPC_PORT,
  APP_CONF_DIR,
} = require('./constants');

// const config = require(path.join(process.cwd(), 'jest-yoshi.config.js'));

const JEST_WORKER_ID = parseInt(process.env.JEST_WORKER_ID, 10);

let COUNTER = 1;

function getPort() {
  return (JEST_WORKER_ID + 3) * 1000 + COUNTER++;
}

module.exports = class BootstrapEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();

    this.config = this.runtime.requireModule(
      path.join(process.cwd(), 'jest-yoshi.config.ts'),
    );

    // const emitter = configEmitter({
    //   sourceFolders: ['./templates'],
    //   targetFolder: APP_CONF_DIR,
    // });

    // this.global.rpcServer = rpcTestkit.server({
    //   port: RPC_PORT,
    // });

    // this.global.app = testkit.app('./index', {
    //   env: {
    //     PORT,
    //     APP_CONF_DIR,
    //     MANAGEMENT_PORT,
    //     NEW_RELIC_LOG_LEVEL: 'warn',
    //     DEBUG: '',
    //   },
    // });

    // await config.bootstrap.emit({
    //   emitter,
    //   staticsUrl: project.servers.cdn.url(),
    //   rpcServer: this.global.rpcServer,
    // });

    // await this.global.rpcServer.start();
    // await this.global.app.start();

    await this.config.bootstrap.setup(this.global, getPort);
  }

  async teardown() {
    await super.teardown();

    // await this.global.app.stop();
    // await this.global.rpcServer.stop();

    // await this.config.bootstrap.teardown(this.global);
  }
};
