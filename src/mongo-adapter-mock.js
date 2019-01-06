'use strict';

const MemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoAdapter = require('./mongo-adapter');

const noop = () => {};

class MongoAdapterMock {
  constructor (logger, config = {}) {
    this._config = config;
  }

  connect () {
    this._server = new MemoryServer();

    return this._server.getConnectionString().then((mongoUri) => {
      const logger = {
        info: noop,
        warn: noop
      };
      const config = Object.assign(this._config, {
        uri: mongoUri
      });
      this._adapter = new MongoAdapter(logger, config);
      return this._adapter.connect();
    });
  }

  disconnect () {
    if (this._server) {
      this._server.stop();
    }
    if (this._adapter) {
      return this._adapter.disconnect();
    } else {
      return Promise.resolve();
    }
  }

  seed (model, data) {
    return model.deleteMany({}).then(() => model.create(data));
  }

  connection () {
    if (this._adapter) {
      return this._adapter.connection();
    }
  }

  db () {
    return this._adapter.db();
  }

  collection (name) {
    return this._adapter.collection(name);
  }

  destroy () {
    this._adapter.destroy();
  }
}

module.exports = MongoAdapterMock;
