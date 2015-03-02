// RESTful API for /users, returns JSON
var qs = require('querystring');
var errors = require('./errors');

/// Supported requests
/// GET /users?id=123,456
/// POST /users
/// PUT /users?id=123
/// DELETE /users?id=123

var latest_user_id = 100001;

function handle(request, query, response, db) {
  switch (request.method) {
    case 'GET':
      // GET /users?id=123,456
      if (query.id != null) {
        var ids = query.id.split(',');
        var filter = {'id': {'$in': ids}};
        db.collection('users').find(filter, {}).toArray(function(err, item) {
          if (item == null) {
            errors.write(response, 'GET', 'cannot find user id ' + query.id);
          } else {
            console.log('GET users id ' + query.id);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(item));
          }
        });
      }
      break;
    case 'POST':
      // POST /users
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
        var post = qs.parse(body);
        post['id'] = 'u' + latest_user_id;
        latest_user_id++;
        console.log('add new user');
        db.collection('users').insert(post, function (err, result) {
          response.end(JSON.stringify(post));
        });
      });
      break;
    case 'PUT':
      // PUT /users?id=123
      if (query.id == null) {
        console.log('PUT w/o id');
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
          var post = qs.parse(body);
          post['id'] = query.id;
          console.log('upsert users id ' + query.id);
          db.collection('users').update({'id': query.id}, post, {upsert: true, w: 0});
          response.end(JSON.stringify(post));
        });
      }
      break;
    case 'DELETE':
      // DELETE /users?id=123
      if (query.id == null) {
        console.log('DELETE w/o id');
        response.end();
      } else {
        console.log('delete users id ' + query.id);
        db.collection('users').remove({'id': query.id}, {justOne: true, w: 0});
        response.end();
      }
      break;
    default:
      errors.write(response, request.method, 'not supported');
  }
}

exports.handle = handle;