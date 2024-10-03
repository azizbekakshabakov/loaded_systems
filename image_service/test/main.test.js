const assert = require('assert');
const mongoose = require('mongoose');
const atlasCreds = require('../atlasCreds');
const { createUser, authenticateUser, createToken } = require('../modules/auth');

before(function(done) {
  this.timeout(60000);

  mongoose.connect(`mongodb+srv://adminUser:${encodeURIComponent(atlasCreds.password)}@atlascluster.zhkoeux.mongodb.net/?retryWrites=true&w=majority`)
    .then(() => done())
    .catch(error => done(error));
});

after(function(done) {
  mongoose.connection.close()
    .then(() => done())
    .catch(error => done(error));
});


describe('Проверка модулей', function() {
  this.timeout(60000);

  describe('createUser()', function() {
    it('возвра код и сообщ', function() {
      return createUser("aziz", "aziz")
        .then(data => {
          assert(data);
          assert.equal(data.code, 400);
          assert.equal(data.message, "Логин зайнит");
        });
    });
  });

  describe('authenticateUser()', function() {
    it('возвра код и сообщ', function() {
      return authenticateUser("sam", "sam")
        .then(data => {
          assert(data);
          assert.equal(data.code, 200);
          assert.equal(data.message, "Данные совпадают");
        });
    });
  });

  describe('createToken()', function() {
    it('возвра токен', function() {
      return createToken("aziz")
        .then(data => {
          assert(data);
        });
    });
  });
});