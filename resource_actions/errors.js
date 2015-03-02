/// error handlers

function write(response, method, message) {
  console.log(method + ' error: ' + message);
  errorjson = {'error': method + ' error: ' + message};
  response.writeHead(404, {'Content-Type': 'text/plain'});
  response.end(JSON.stringify(errorjson));
}

exports.write = write;

