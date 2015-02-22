function handle(request, query, response, db) {
  response.setHeader('Content-Type', 'text/plain');
  response.write('Hello');
  response.end();
}

exports.handle = handle;