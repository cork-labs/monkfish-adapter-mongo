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
      useNewUrlParser: true
    }, config.options);

    this._emitter = mixinEmitter(this);
  }

  connect () {
    const connection = MongoClient.connect(this._config.uri, this._connectionOptions)
      .then((connection) => {
        this._emitter.emit('connected');

        this._connection = connection;
        this._db = this._connection.db();
        this._logger.info('monkfish.adapter.mongo.connected');

        connection.on('disconnected', () => {
          this._logger.warn('monkfish.adapter.mongo.disconnected');
          this._emitter.emit('disconnected');
        });
      });

    return connection;
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
