const JEST_WORKER_ID = parseInt(process.env.JEST_WORKER_ID, 10);

let COUNTER = 1;

module.exports.getPort = () => {
  return (JEST_WORKER_ID + 3) * 1000 + COUNTER++;
};

// module.exports.PORT = 3100 + JEST_WORKER_ID;
// module.exports.MANAGEMENT_PORT = 3200 + JEST_WORKER_ID;
// module.exports.RPC_PORT = 3300 + JEST_WORKER_ID;
// module.exports.APP_CONF_DIR = `./target/configs-${JEST_WORKER_ID}`;
