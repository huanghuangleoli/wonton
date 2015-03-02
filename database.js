var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;
var Server = mongo.Server;
var assert = require('assert');

function initDB(dbname, onStart) {
  var mongoClient = new MongoClient(new Server('localhost', 27017));
  mongoClient.open(function(err, mongoClient) {
    console.log('db ' + dbname + ' is opened.');
    db = mongoClient.db(dbname);
    onStart(db);
  });
}

function clearDB(dbname) {
  var mongoClient = new MongoClient(new Server('localhost', 27017));
  var db;

  mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db(dbname);
    var futuredone = 0;

    // Clean dirty data.
    db.dropCollection('posts', function(err, result) {
      db.collectionNames('posts', function(err, names) {
        assert.equal(0, names.length);
        console.log('collection posts is cleared.');
        if (futuredone < 3) {
          futuredone++;
        } else {
          db.close();
          mongoClient.close();
        }
      });
    });
    db.dropCollection('elements', function(err, result) {
      db.collectionNames('elements', function(err, names) {
        assert.equal(0, names.length);
        console.log('collection elements is cleared.');
        if (futuredone < 3) {
          futuredone++;
        } else {
          db.close();
          mongoClient.close();
        }
      });
    });
    db.dropCollection('users', function(err, result) {
      db.collectionNames('users', function(err, names) {
        assert.equal(0, names.length);
        console.log('collection users is cleared.');
        if (futuredone < 3) {
          futuredone++;
        } else {
          db.close();
          mongoClient.close();
        }
      });
    });
    db.dropCollection('comments', function(err, result) {
      db.collectionNames('comments', function(err, names) {
        assert.equal(0, names.length);
        console.log('collection comments is cleared.');
        if (futuredone < 3) {
          futuredone++;
        } else {
          db.close();
          mongoClient.close();
        }
      });
    });
  });
}

function loadFromJsonFile(dbname) {
  var mongoClient = new MongoClient(new Server('localhost', 27017));
  var db;

  mongoClient.open(function(err, mongoClient) {
    db = mongoClient.db(dbname);
    var futuredone = 0;
    db.createCollection('posts', {
      strict: true,
      capped: false,
      size: 5242880,
      autoIndexId: true,
      w: 1
    }, function (err, collection) {
      if (err) {
        console.log(err);
      } else {
        var parsedJSON = require('./data/posts.json');
        for (var i = 0; i < parsedJSON.length; i++) {
          collection.insert(parsedJSON[i], {}, function (colerr, result) {
          });
        }
      }
      console.log('Loaded json file to db ' + dbname);
      if (futuredone  < 3) {
        futuredone++;
      } else {
        db.close();
        mongoClient.close();
      }
    });
    db.createCollection('elements', {
      strict: true,
      capped: false,
      size: 5242880,
      autoIndexId: true,
      w: 1
    }, function (err, collection) {
      if (err) {
        console.log(err);
      } else {
        var parsedJSON = require('./data/elements.json');
        for (var i = 0; i < parsedJSON.length; i++) {
          collection.insert(parsedJSON[i], {}, function (colerr, result) {
          });
        }
      }
      console.log('Loaded json file to db ' + dbname);
      if (futuredone  < 3) {
        futuredone++;
      } else {
        db.close();
        mongoClient.close();
      }
    });
    db.createCollection('users', {
      strict: true,
      capped: false,
      size: 5242880,
      autoIndexId: true,
      w: 1
    }, function (err, collection) {
      if (err) {
        console.log(err);
      } else {
        var parsedJSON = require('./data/users.json');
        for (var i = 0; i < parsedJSON.length; i++) {
          collection.insert(parsedJSON[i], {}, function (colerr, result) {
          });
        }
      }
      console.log('Loaded json file to db ' + dbname);
      if (futuredone < 3) {
        futuredone++;
      } else {
        db.close();
        mongoClient.close();
      }
    });
    db.createCollection('comments', {
      strict: true,
      capped: false,
      size: 5242880,
      autoIndexId: true,
      w: 1
    }, function (err, collection) {
      if (err) {
        console.log(err);
      } else {
        var parsedJSON = require('./data/comments.json');
        for (var i = 0; i < parsedJSON.length; i++) {
          collection.insert(parsedJSON[i], {}, function (colerr, result) {
          });
        }
      }
      console.log('Loaded comments json file to db ' + dbname);
      if (futuredone < 3) {
        futuredone++;
      } else {
        db.close();
        mongoClient.close();
      }
    });
  });
}

exports.initDB = initDB;
exports.clearDB = clearDB;
exports.loadFromJsonFile = loadFromJsonFile;