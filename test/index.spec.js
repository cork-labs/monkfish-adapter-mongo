'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinonChai = require('sinon-chai');
chai.use(sinonChai);

const Module = require('../src/index');

describe('monkfish-adapter-mongo', function () {
  it('should be an object', function () {
    expect(Module).to.be.a('object');
  });

  it('should expose the module`s API', function () {
    expect(Module.MongoAdapter).to.be.an('function');
    expect(Module.MongoAdapterMock).to.be.an('function');
  });
});
