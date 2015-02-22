function route(handles, pathname, request, query, response, db) {
  if (typeof handles[pathname] === 'function') {
    console.log('Route a request for ' + pathname);
    handles[pathname](request, query, response, db);
  } else {
    console.log('No request handle for ' + pathname);
    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('404 Not found');
    response.end();
  }
}

exports.route = route;

