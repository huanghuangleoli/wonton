var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');
var database = require('./database');

var portNum = 8124;

function onStart(db) {
  server.start(router.route, requestHandlers.handles, portNum, db);
}
database.clearDB('dinneract');
database.loadFromJsonFile('dinneract');
database.initDB('dinneract', onStart);

