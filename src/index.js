const ObjectId = require('mongodb').ObjectId;

const MongoAdapter = require('./mongo-adapter');
const MongoAdapterMock = require('./mongo-adapter-mock');

module.exports = {
  ObjectId,
  MongoAdapter,
  MongoAdapterMock
};
