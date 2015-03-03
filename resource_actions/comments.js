// RESTful API for /comments, returns JSON
var qs = require('querystring');
var config = require('./config');
var errors = require('./errors');

/// Supported requests
/// GET /comments?postid=123
/// GET /comments?postid=123&offset=20
/// POST /comments?postid=123
/// TODO: support PUT /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234
/// DELETE /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'GET':
      // GET /comments?postid=123
      // GET /comments?postid=123&offset=20
      if (query.postid != null) {
        var offset = 0;
        if (query.offset != null) {
          offset = parseInt(query.offset);
        }
        var filter = { 'postid': query.postid };
        var fields = { comments: { $slice: [offset, config.comments_get_limit] }};
        db.collection('comments').find(filter, fields).toArray(function (err, item) {
          if (item == null || item.length == 0) {
            errors.write(response, 'GET', 'postid ' + query.postid + ' not found');
          } else {
            console.log('GET comments postid ' + query.postid);
            response.end(JSON.stringify(item));
          }
        });
      } else {
        errors.write(response, 'GET', 'requires postid');
      }
      break;
    case 'POST':
      // POST /comments?postid=123
      if (query.postid == null) {
        errors.write(response, 'POST', 'requires postid');
        break;
      }
      db.collection('comments').findOne({'postid': query.postid}, function (err, item) {
        if (item == null) {
          errors.write(response, 'POST', 'post id ' + query.postid + ' not found');
        } else {
          var body = '';
          var dataCount = 0;
          request.on('data', function (data) {
            body += data;
            dataCount++;
            // If length is too long just kill it.
            if (body.length > 1e5 || dataCount > 100) {
              request.connection.destroy();
            }
          });
          request.on('end', function () {
            var comment = qs.parse(body);
            comment['createAt'] = 'time-now';
            comment['createBy'] = 'currentuser';
            comment['slug'] = 'my-slug';
            console.log('add new comment');
            db.collection('comments').update(
                { postid: query.postid },
                { $addToSet: {comments: comment }}
                , function (err, result) {
                  response.end();
                });
          });
        }
      });
      break;
    case 'DELETE':
      // DELETE /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234
      if (query.postid == null) {
        errors.write(response, 'DELETE', 'requires postid');
        break;
      }
      if (query.createAt == null) {
        errors.write(response, 'DELETE', 'requires createAt');
        break;
      }
      if (query.slug == null) {
        errors.write(response, 'DELETE', 'requires slug');
        break;
      }
      db.collection('comments').update(
          { postid: query.postid },
          { $pull: { comments: { createAt: query.createAt, slug: query.slug }}},
          { multi: true },
          function (err, result) {
            console.log('deleted comment from post id ' + query.postid);
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end();
          });
      break;
    default:
      errors.write(response, request.method, 'not supported');
  }
}

exports.handle = handle;