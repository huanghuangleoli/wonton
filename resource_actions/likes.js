// RESTful API for /likes, returns JSON
var qs = require('querystring');

/// Supported requests
/// POST /likes?postid=123
/// POST /likes?postid=123&unlike=true

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'POST':
        // when unlike exists, supports only unlike=true
        if (query.postid == null) {
          response.writeHead(404, {'Content-Type': 'text/plain'});
          errorjson = {'error': 'cannot like without postid'};
          response.end(JSON.stringify(errorjson));
          break;
        }
        if (query.unlike != null){
          if (query.unlike != 'true') {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            errorjson = {'error': '?unlike= can only be true'};
            response.end(JSON.stringify(errorjson));
            break;
          }
          db.collection('posts').update(
              { id: query.postid },
              { $inc: { liked_num: 1 }}
              , function (err, result) {
                  response.writeHead(200, {'Content-Type': 'text/plain'});
                  response.end();
              });
          //TODO user fav list
        } else {
          db.collection('posts').update(
              { id: query.postid },
              { $inc: { liked_num: -1 }}
              , function (err, result) {
                  response.writeHead(200, {'Content-Type': 'text/plain'});
                  response.end();
              });
          //TODO user fav list
        }
      break;
    default:
      response.writeHead(404, {'Content-Type': 'text/plain'});
      errorjson = {'error': request.method + ' is not supported'};
      response.end(JSON.stringify(errorjson));
  }
}

exports.handle = handle;