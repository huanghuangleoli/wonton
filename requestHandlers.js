var posts = require('./resource-actions/posts');
var elements = require('./resource-actions/elements');
var users = require('./resource-actions/users');
var index = require('./resource-actions/index');

var handles = {};
handles['/'] = index.handle;
handles['/index'] = index.handle;
handles['/posts'] = posts.handle;
handles['/elements'] = elements.handle;
handles['/users'] = users.handle;

exports.handles = handles;
