const MongoClient = require('mongodb').MongoClient;

const mixinEmitter = require('@cork-labs/mixin-emitter');

const defaults = {
  reconnectTries: 3
};

class MongoAdapter {
  constructor (logger, config) {
    this._logger = logger;
    this._config = Object.assign({}, defaults, config);
    this._connectionOptions = Object.assign({
      keepAlive: true,
      reconnectTries: this._config.reconnectTries,
      useNewUrlParser: true
    }, config.options);

    this._emitter = mixinEmitter(this);
  }

  connect () {
    return MongoClient.connect(this._config.uri, this._connectionOptions)
      .then((connection) => {
        this._connection = connection;
        this._db = this._connection.db();
        this._logger.info('MongoAdapter::connect() connected');
      })
      .catch(() => {
        this._logger.warn('MongoAdapter::connect() disconnected');
        this._emitter.emit('disconnected');
      });
  }

  disconnect () {
    return new Promise((resolve, reject) => {
      this._connection.close(true, () => {
        delete this._connection;
        delete this._db;
        this._emitter.emit('closed');
        resolve();
      });
    });
  }

  connection () {
    return this._connection;
  }

  db () {
    return this._db;
  }

  collection (name) {
    return this._db.collection(name);
  }

  destroy () {
    this._emitter.removeAllListeners();
  }
}

module.exports = MongoAdapter;
