// RESTful API for /posts, returns JSON

// TODO: support PUT
var qs = require('querystring');
var config = require('./config');
var errors = require('./errors');

/// Supported requests
/// GET /posts
/// GET /posts?offset=20
/// GET /posts?id=123
/// POST /posts
/// PUT /posts?id=123
/// DELETE /posts?id=123

var latest_post_id = 100001;

function handle(request, query, response, db) {
  switch (request.method) {
    case 'GET':
      // GET /posts?id=123
        if (query.id != null) {
          db.collection('posts').findOne({'id': query.id}, function (err, item) {
            if (item == null) {
              erros.write(response, 'GET', 'post id ' + query.id + ' not found');
            } else {
              console.log('GET posts id ' + query.id);
              response.writeHead(200, {'Content-Type': 'application/json'});
              response.end(JSON.stringify(item));
            }
          });
        }
      // GET /posts
      // GET /posts?offset=20
        else {
          var offset = 0;
          if (query.offset != null) {
            offset = query.offset;
          }
          // TODO: move to config.js
          var filter_for_posts = {};
          var fields_for_posts = { _id: 0 };
          var fields_for_users = {
            id: 1,
            name: 1,
            portrait: 1,
            location: 1,
            role: 1
          };
          db.collection('posts')
              .find(filter_for_posts, fields_for_posts)
              .limit(config.posts_get_limit)
              .sort({'create.on': -1})
              .skip(offset)
              .toArray(function(err, items) {
                var createByIds = items.map(function (item) {
                  return item.create.by;
                });
                var filter_for_users = {'id': {'$in': createByIds}};
                db.collection('users').find(filter_for_users, fields_for_users).toArray(function (err, userInfo) {
                  var userInfoMap = {};
                  userInfo.forEach(function(info) {
                    userInfoMap[info.id] = info;
                  });
                  items.forEach(function(item) {
                    item['creator'] = userInfoMap[item.create.by];
                  });
                  var json = {'items': items};
                  console.log('return post list');
                  response.writeHead(200, {'Content-Type': 'application/json'});
                  response.end(JSON.stringify(json));
                });
              });
        }
        break;
    case 'POST':
        // POST /posts
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
          post['id'] = 'p' + latest_post_id;
          latest_post_id++;
          db.collection('posts').insert(post, function (err, result) {
            console.log('add new post');
            response.writeHead(201, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(post));
          });
        });
        break;
    case 'PUT':
      // PUT /posts?id=123
      if (query.id == null) {
        erros.write(response, 'PUT', 'requires id');
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
          db.collection('posts').update({'id': query.id}, post, {upsert: true, w: 0});
          console.log('upsert post id ' + query.id);
          response.writeHead(200, {'Content-Type': 'application/json'});
          response.end(JSON.stringify(post));
        });
      }
      break;
    case 'DELETE':
      // DELETE /posts?id=123
      if (query.id == null) {
        erros.write(response, 'DELETE', 'requires id');
      } else {
        db.collection('posts').remove({'id': query.id}, {justOne: true, w: 0});
        console.log('delete post id ' + query.id);
        response.writeHead(200, {'Content-Type': 'application/json'});
        response.end();
      }
      break;
    default:
      erros.write(response, request.method, 'not supported');
  }
}

exports.handle = handle;