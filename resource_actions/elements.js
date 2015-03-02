// RESTful API for /elements, returns JSON
var qs = require('querystring');
var config = require('./config');
var errors = require('./errors');

/// Supported requests
/// GET /elements
/// GET /elements?offset=20
/// GET /elements?id=123,456
/// POST /elements
/// PUT /elements?id=123
/// DELETE /elements?id=123

var latest_element_id = 100001;

function handle(request, query, response, db) {
  switch (request.method) {
    case 'GET':
      // GET /elements?id=123,456
      if (query.id != null) {
        var ids = query.id.split(',');
        var filter = {'id': {'$in': ids}};
        db.collection('elements').find(filter, {}).toArray(function(err, item) {
          if (item == null) {
            errors.write(response, 'GET', 'elements id ' + query.id + ' not found');
          } else {
            console.log('GET elements id ' + query.id);
            response.end(JSON.stringify(item));
          }
        });
      }
      // GET /elements
      // GET /elements?offset=20
      else {
        var offset = 0;
        if (query.offset != null) {
          offset = query.offset;
        }
        var filter1 = {};
        var fields1 = { _id: 0 };
        db.collection('elements')
            .find(filter1, fields1)
            .limit(config.elements_get_limit)
            .sort({'create.on': -1})
            .skip(offset)
            .toArray(function(err, items) {
              var json = {'items': items};
              console.log('return all elements');
              response.end(JSON.stringify(json));
            });
      }
      break;
    case 'POST':
      // POST /elements
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
        post['id'] = 'e' + latest_element_id.toString();
        latest_element_id++;
        db.collection('elements').insert(post, function (err, result) {
          console.log('added new post');
          response.end(JSON.stringify(post));
        });
      });
      break;
    case 'PUT':
      // PUT /elements?id=123
      if (query.id == null) {
        errors.write(response, 'PUT', 'requires id');
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
          db.collection('elements').update({'id': query.id}, post, {upsert: true, w: 0});
          console.log('upserted elements id ' + query.id);
          response.end(JSON.stringify(post));
        });
      }
      break;
    case 'DELETE':
      // DELETE /elements?id=123
      if (query.id == null) {
        errors.write(response, 'DELETE', 'requires id');
      } else {
        db.collection('elements').remove({'id': query.id}, {justOne: true, w: 0});
        console.log('deleted elements id ' + query.id);
        response.end();
      }
      break;
    default:
      errors.write(response, request.method, 'not supported');
  }
}

exports.handle = handle;