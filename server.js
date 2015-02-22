// this is a toy http server using nodejs
var http = require('http');
var url = require('url');

function start(route, handles, portNum, db) {
  function onRequest(request, response) {
    var parsedUrl = url.parse(request.url, true);
    route(handles, parsedUrl.pathname, request, parsedUrl.query,  response, db);
  }

  http.createServer(onRequest).listen(portNum);
}

exports.start = start;
