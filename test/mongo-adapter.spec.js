'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const MongoAdapter = require('../src/mongo-adapter');

const noop = () => {};
const logger = {
  info: noop,
  warn: noop
};

describe('MongoAdapter', function () {
  it('should be a function', function () {
    expect(MongoAdapter).to.be.a('function');
  });

  describe('connect()', function () {
    before(function () {
      this.subject = new MongoAdapter(logger, {uri: 'mongodb://localhost/mongo-adapter-test'});
    });

    after(async function () {
      await this.subject.disconnect();
    });

    it('should connect', async function () {
      await this.subject.connect();
    });
  });

  describe('given a connection', function () {
    before(async function () {
      this.subject = new MongoAdapter(logger, {uri: 'mongodb://localhost/mongo-adapter-test'});
      await this.subject.connect();
      this._conn = this.subject.connection();
      await this._conn.db().collection('aaa').deleteMany({});
    });

    after(async function () {
      await this.subject.disconnect();
    });

    describe('db()', function () {
      it('should expose the underlying db object', async function () {
        const db = this.subject.db();
        expect(db.constructor.name).to.equal('Db');
      });
    });

    describe('collection()', function () {
      it('should expose the underlying collection object', async function () {
        const collection = this.subject.collection('foo');
        expect(collection.constructor.name).to.equal('Collection');
        expect(collection.namespace).to.equal('mongo-adapter-test.foo');
      });
    });

    describe('mongo insert and read', function () {
      it('should insert', async function () {
        const collection = this.subject.collection('aaa');
        await collection.insertOne({foo: 'bar'});
        await collection.updateOne({foo: 'bar'}, {$set: {foo: 'baz'}});
        await collection.deleteOne({foo: 'baz'});
        await collection.insertOne({foo: 'qux'});
      });

      it('should find', async function () {
        const collection = this.subject.collection('aaa');
        const result = await collection.findOne({foo: 'qux'});
        expect(result._id).to.match(/^[a-z0-9]{24}$/);
        expect(result.foo).to.equal('qux');
      });
    });
  });
});
