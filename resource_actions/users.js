// RESTful API for /users, returns JSON
var qs = require('querystring');

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'GET':
      if (query.id != null) {
        // GET one user
        db.collection('users').findOne({'id': query.id}, function(err, item) {
          if (item == null) {
            console.log('GET users id = ' + query.id + ' not found');
            response.end();
          } else {
            console.log('GET users id ' + query.id);
            response.end(JSON.stringify(item));
          }
        });
      } else {
        // GET all users
        db.collection('users').find().toArray(function(err, items) {
          var json = {'items': items};
          console.log('return all users');
          response.end(JSON.stringify(json));
        });
      }
      break;
    case 'POST':
      if (query.id == null) {
        console.log('POST w/o id');
        response.end();
        break;
      }
      db.collection('users').findOne({'id': query.id}, function(err, item) {
        if (item != null) {
          console.log('users id ' + query.id + ' already exists');
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
            console.log('add new post id ' + query.id);
            db.collection('users').insert(post, function (err, result) {
              response.end(JSON.stringify(post));
            });
          });
        }
      });
      break;
    case 'PUT':
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
    // Do nothing.
  }
}

exports.handle = handle;