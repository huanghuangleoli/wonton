// RESTful API for /likes, returns JSON
var qs = require('querystring');
var errors = require('./errors');

/// Supported requests
/// TODO: remove userid when login is ready
/// POST /likes?postid=123&userid=u000001
/// POST /likes?postid=123&userid=u000001&unlike=true

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'POST':
      if (query.postid == null) {
        errors.write(response, 'POST', 'requires postid');
        break;
      }
      if (query.userid == null) {
        errors.write(response, 'POST', 'requires userid');
        break;
      }
      // unlike
      if (query.unlike != null){
        if (query.unlike != 'true') {
          errors.write(response, 'POST', 'only supports unlike=true');
          break;
        }
        db.collection('posts').update(
            { id: query.postid },
            { $inc: { liked_num: -1 }}
            , function (err, result) {
              db.collection('users').update(
                  { id: query.userid },
                  { $pull: { liked_posts: { "post": query.postid }}}
                  , function (err, result) {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end();
                  });
            });
      }
      // like
      else {
        db.collection('posts').update(
            { id: query.postid },
            { $inc: { liked_num: 1 }}
            , function (err, result) {
              db.collection('users').update(
                  { id: query.userid },
                  { $addToSet: { liked_posts: { "post": query.postid }}}
                  , function (err, result) {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.end();
                  });
            });
      }
      break;
    default:
      errors.write(response, request.method, 'not supported');
  }
}

exports.handle = handle;