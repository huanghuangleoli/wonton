// RESTful API for /comments, returns JSON
var qs = require('querystring');
var config = require('./config');

/// Supported requests
/// GET /comments?postid=123
/// GET /comments?postid=123&offset=20
/// POST /comments?postid=123
/// PUT /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234
/// DELETE /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'GET':
      if (query.postid != null) {
        // GET /comments?postid=123&offset=20
        var offset = 0;
        if (query.offset != null) offset = query.offset;
        var filter = {'id': query.id};
        var fields = { comments: { $slice: [offset, config.comments_get_limit]}};
        db.collection('comments').find(filter, fields).toArray(function(err, item) {
          if (item == null || item.length == 0) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            errorjson = {'error': 'GET comments postid = ' + query.postid + ' not found'};
            response.end(JSON.stringify(errorjson));
          } else {
            console.log('GET comments postid ' + query.postid);
            response.end(JSON.stringify(item));
          }
        });
      } else {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        errorjson = {'error': 'cannot GET comments without postid'};
        response.end(JSON.stringify(errorjson));
      }
      break;
    case 'POST':
      if (query.postid == null) {
        console.log('POST w/o postid');
        response.end();
        break;
      }
      // POST /elements?id=123
      db.collection('comments').findOne({'postid': query.postid}, function(err, item) {
        if (item == null) {
          console.log('post id ' + query.postid + ' does not exist');
          response.end();
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
            comment['createAt'] = 'time now';
            comment['createBy'] = 'currentuser';
            comment['slug'] = 'my slug';
            console.log('add new comment');
            db.collection('comments').update(
                { postid: query.postid },
                { $addToSet: { comments: comment }}
                , function (err, result) {
              response.end();
            });
          });
        }
      });
      break;
    case 'PUT':
      //if (query.id == null) {
      //  console.log('PUT w/o id');
      //  response.end();
      //} else {
      //  // PUT /comments?id=123
      //  var body = '';
      //  var dataCount = 0;
      //  request.on('data', function (data) {
      //    body += data;
      //    dataCount++;
      //    // If length is too long just kill it.
      //    if (body.length > 1e5 || dataCount > 100) {
      //      request.connection.destroy();
      //    }
      //  });
      //  request.on('end', function () {
      //    var post = qs.parse(body);
      //    post['id'] = query.id;
      //    console.log('upsert comments id ' + query.id);
      //    db.collection('comments').update({'id': query.id}, post, {upsert: true, w: 0});
      //    response.end(JSON.stringify(post));
      //  });
      //}
      break;
    case 'DELETE':
      if (query.postid == null || query.createAt == null || query.slug == null) {
        console.log('DELETE w/o correct info');
        response.writeHead(404, {'Content-Type': 'text/plain'});
        errorjson = {'error': 'cannot delete comment without post id'};
        response.end(JSON.stringify(errorjson));
      } else {
        // DELETE /comments?postid=123&createAt=2015-01-01-10-10-12&slug=abdc-1234
        console.log('delete comment from post id ' + query.postid);
        db.collection('comments').update(
            { postid: query.postid },
            { $pull: { comments:
                {
                  createAt: query.createAt,
                  slug: query.slug
                }
            }},
            function (err, result) {
              response.writeHead(200, {'Content-Type': 'text/plain'});
              response.end();
            });
      }
      break;
    default:
      response.writeHead(404, {'Content-Type': 'text/plain'});
      errorjson = {'error': request.method + ' is not supported'};
      response.end(JSON.stringify(errorjson));
  }
}

exports.handle = handle;