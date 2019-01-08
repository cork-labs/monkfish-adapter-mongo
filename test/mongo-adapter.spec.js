'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
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
    beforeEach(function () {
      this.subject = new MongoAdapter(logger, {uri: 'mongodb://localhost/mongo-adapter-test'});
      this.promise = this.subject.connect();
    });

    afterEach(async function () {
      await this.subject.disconnect();
    });

    it('should connect', async function () {
      return expect(this.promise).to.be.fulfilled;
    });
  });

  describe('given a connection', function () {
    beforeEach(async function () {
      this.collectionName = 'foo';
      this.subject = new MongoAdapter(logger, {uri: 'mongodb://localhost/mongo-adapter-test'});
      await this.subject.connect();
      this._conn = this.subject.connection();
      await this._conn.db().collection(this.collectionName).deleteMany({});
    });

    afterEach(async function () {
      await this.subject.disconnect();
    });

    describe('connection()', function () {
      it('should expose the underlying connection object', async function () {
        const connection = this.subject.connection();
        expect(connection.constructor.name).to.equal('MongoClient');
      });
    });

    describe('db()', function () {
      it('should expose the underlying db object', async function () {
        const db = this.subject.db();
        expect(db.constructor.name).to.equal('Db');
      });
    });

    describe('collection()', function () {
      it('should expose the underlying collection object', async function () {
        const collection = this.subject.collection(this.collectionName);
        expect(collection.constructor.name).to.equal('Collection');
        expect(collection.namespace).to.equal('mongo-adapter-test.foo');
      });
    });

    describe('mongo collection basic commands', function () {
      beforeEach(function () {
        this.collection = this.subject.collection(this.collectionName);
      });

      describe('insertOne()', function () {
        beforeEach(function () {
          this.promise = this.collection.insertOne({foo: 'bar'});
        });

        it('should resolve', async function () {
          return expect(this.promise).to.be.fulfilled;
        });

        it('should resolve with a result object', async function () {
          const result = await this.promise;
          expect(result).to.be.an('object');
          expect(result.insertedCount).to.equal(1);
          expect(result.insertedId).to.match(/^[a-z0-9]{24}$/);
        });
      });

      describe('updateOne()', function () {
        beforeEach(async function () {
          await this.collection.insertOne({foo: 'bar'});
          this.promise = this.collection.updateOne({foo: 'bar'}, { $set: {foo: 'baz'} });
        });

        it('should resolve', async function () {
          return expect(this.promise).to.be.fulfilled;
        });

        it('should resolve with a result object', async function () {
          const result = await this.promise;
          expect(result).to.be.an('object');
          expect(result.matchedCount).to.equal(1);
          expect(result.modifiedCount).to.equal(1);
        });
      });

      describe('deleteOne()', function () {
        beforeEach(async function () {
          await this.collection.insertOne({foo: 'qux'});
          this.promise = this.collection.deleteOne({foo: 'qux'});
        });

        it('should resolve', async function () {
          return expect(this.promise).to.be.fulfilled;
        });

        it('should resolve with a result object', async function () {
          const result = await this.promise;
          expect(result).to.be.an('object');
          expect(result.deletedCount).to.equal(1);
        });
      });

      describe('findOne()', function () {
        beforeEach(async function () {
          await this.collection.insertOne({foo: 'bar'});
          this.promise = this.collection.findOne({foo: 'bar'});
        });

        it('should resolve', async function () {
          return expect(this.promise).to.be.fulfilled;
        });

        it('should resolve with the document', async function () {
          const result = await this.promise;
          expect(result).to.be.an('object');
          expect(result._id).to.match(/^[a-z0-9]{24}$/);
          expect(result.foo).to.equal('bar');
        });
      });

      describe('find()', async function () {
        beforeEach(async function () {
          this.collection = this.subject.collection(this.collectionName);
          await this.collection.insertOne({foo: 'bar'});
          await this.collection.insertOne({foo: 'baz'});
          this.promise = this.collection.find({}).toArray();
        });

        it('should resolve', async function () {
          return expect(this.promise).to.be.fulfilled;
        });

        it('should resolve with all documents', async function () {
          const results = await this.promise;
          expect(results).to.be.an('array');
          expect(results.length).to.equal(2);
          expect(results[0]._id).to.match(/^[a-z0-9]{24}$/);
          expect(results[0].foo).to.equal('bar');
          expect(results[1]._id).to.match(/^[a-z0-9]{24}$/);
          expect(results[1].foo).to.equal('baz');
        });
      });
    });
  });
});
