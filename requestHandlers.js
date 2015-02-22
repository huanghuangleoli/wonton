var posts = require('./resource_actions/posts');
var elements = require('./resource_actions/elements');
var users = require('./resource_actions/users');
var index = require('./resource_actions/index');

var handles = {};
handles['/'] = index.handle;
handles['/index'] = index.handle;
handles['/posts'] = posts.handle;
handles['/elements'] = elements.handle;
handles['/users'] = users.handle;

exports.handles = handles;
