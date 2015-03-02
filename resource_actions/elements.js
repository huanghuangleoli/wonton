// RESTful API for /elements, returns JSON
var qs = require('querystring');
var config = require('./config');

/// Supported requests
/// GET /elements
/// GET /elements?offset=20
/// GET /elements?id=123,456
/// POST /elements
/// PUT /elements?id=123
/// DELETE /elements?id=123

var latest_element_id = 100001;

function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'application/json');
  switch (request.method) {
    case 'GET':
      if (query.id != null) {
        // GET /elements?id=123,456
        var ids = query.id.split(',');
        var filter = {'id': {'$in': ids}};
        db.collection('elements').find(filter, {}).toArray(function(err, item) {
          if (item == null) {
            console.log('GET elements id = ' + query.id + ' not found');
            response.end();
          } else {
            console.log('GET elements id ' + query.id);
            response.end(JSON.stringify(item));
          }
        });
      } else {
        // GET /elements
        // GET /elements?offset=20
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
        console.log('add new post id');
        db.collection('elements').insert(post, function (err, result) {
          response.end(JSON.stringify(post));
        });
      });
      break;
    case 'PUT':
      if (query.id == null) {
        console.log('PUT w/o id');
        response.end();
      } else {
        // PUT /elements?id=123
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
          console.log('upsert elements id ' + query.id);
          db.collection('elements').update({'id': query.id}, post, {upsert: true, w: 0});
          response.end(JSON.stringify(post));
        });
      }
      break;
    case 'DELETE':
      if (query.id == null) {
        console.log('DELETE w/o id');
        response.end();
      } else {
        // DELETE /elements?id=123
        console.log('delete elements id ' + query.id);
        db.collection('elements').remove({'id': query.id}, {justOne: true, w: 0});
        response.end();
      }
      break;
    default:
      response.writeHead(404, {'Content-Type': 'text/plain'});
      errorjson = {'error': request.method + ' is not supported'};
      response.end(JSON.stringify(errorjson));
  }
}

exports.handle = handle;