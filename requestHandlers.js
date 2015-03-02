var posts = require('./resource_actions/posts');
var elements = require('./resource_actions/elements');
var users = require('./resource_actions/users');
var index = require('./resource_actions/index');
var comments = require('./resource_actions/comments');
var likes = require('./resource_actions/likes')

var handles = {};
handles['/'] = index.handle;
handles['/index'] = index.handle;
handles['/posts'] = posts.handle;
handles['/elements'] = elements.handle;
handles['/users'] = users.handle;
handles['/comments'] = comments.handle;
handles['/likes'] = likes.handle;

exports.handles = handles;
