var http = require('http');
var assert = require('assert');

var mongo = require('mongodb');
var BSON = mongo.BSONPure;

var MongoClient = mongo.MongoClient, 
	Server = mongo.Server;
	
var mongoClient = new MongoClient(new Server('localhost', 27017));
var db;

mongoClient.open(function(err, mongoClient) {
	assert.equal(null, err);
	db = mongoClient.db("dinneract"); // The DB is set here
	
	/*
	// Drop the collection from this world
    db.dropCollection("posts", function(err, result) {
    	assert.equal(null, err);

    	// Verify that the collection is gone
        db.collectionNames("posts", function(err, names) {
            assert.equal(0, names.length);
            //db.close();
        });
    });
    
    db.dropCollection("elements", function(err, result) {
    	assert.equal(null, err);
		
    	// Verify that the collection is gone
        db.collectionNames("elements", function(err, names) {
            //assert.equal(0, names.length);
            //console.log(err);
            //db.close();
        });
    });
    
    db.dropCollection("users", function(err, result) {
    	assert.equal(null, err);
		
    	// Verify that the collection is gone
        db.collectionNames("users", function(err, names) {
            //assert.equal(0, names.length);
            //console.log(err);
            //db.close();
        });
    });
    */
    
	
	db.createCollection("posts", { strict: true, capped: false, size: 5242880, autoIndexId: true, w: 1}, function(err, collection) {
		//assert.equal(null, err);
		if(err) {
			console.log(err);
   		}else{
			// Retrieve our document
			var parsedJSON = require('./posts.json');
	          
			for(var i=0; i < parsedJSON.length; i++) {
	          	// Insert a document in the capped collection
	          	collection.insert(parsedJSON[i], {}, function(colerr, result){
	          		assert.equal(null, colerr);
				});
			}
		}
	});
	
	db.createCollection("elements", { strict: true, capped: false, size: 5242880, autoIndexId: true, w: 1}, function(err, collection) {
		//assert.equal(null, err);
		if(err) {
			console.log(err);
   		}else{
			// Retrieve our document
			var parsedJSON = require('./elements.json');
	          
			for(var i=0; i < parsedJSON.length; i++) {
	          	// Insert a document in the capped collection
	          	collection.insert(parsedJSON[i], {}, function(colerr, result){
	          		assert.equal(null, colerr);
				});
			}
		}
	});
	
	db.createCollection("users", { strict: true, capped: false, size: 5242880, autoIndexId: true, w: 1}, function(err, collection) {
		//assert.equal(null, err);
		if(err) {
			console.log(err);
   		}else{
			// Retrieve our document
			var parsedJSON = require('./users.json');
	          
			for(var i=0; i < parsedJSON.length; i++) {
	          	// Insert a document in the capped collection
	          	collection.insert(parsedJSON[i], {}, function(colerr, result){
	          		assert.equal(null, colerr);
				});
			}
		}
	});
});


var dataOp_posts = ( function(paras, res) {
	
	db.collection("posts", function(colerr, collection) {
		
		//console.log(colerr);
		assert.equal(null, colerr);
		
		if(paras.length == 4) { //get all
			
			var postNumLimitPerReq = 50;
			
			if(paras[3] == "full") {
				
				collection.find({}, { fields: {title: 0, photo: 0, create: 0, _id: 0}, skip: 0, limit: postNumLimitPerReq, sort: [['create.last','desc']] }).toArray(function(err, data) {
					assert.equal(null, err);
				    //console.log(data);
				    res.writeHead(200, {
				    	'Content-Type': 'text/plain',
				    	'Access-Control-Allow-Origin': '*',
				    	'Access-Control-Allow-Methods': 'GET, POST',
				    	'Access-Control-Allow-Headers': 'Content-Type'
				    });
			
				    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
				}); 
				
			} else {
				
				collection.aggregate([
					{ $project:
						{ _id: 0, id: 1, title: 1, photo: 1, create: 1, like_num: { $size: "$likes" } }
					},
					{ $skip : 0 },
					{ $limit: postNumLimitPerReq },
					{ $sort : { "create.last" : -1 } }
				], function(err, postData) {
					assert.equal(null, err);
				    //console.log(err); console.log(postData);
				    var i,
				    	userIds = [],
				    	hashMap = {};
				    var allData = postData;
				    for(i = 0; i < postData.length; i++) {
				    	if(postData[i].create.by.length>0 && !hashMap[postData[i].create.by]) {
				    		hashMap[postData[i].create.by] = true;
				    		userIds.push(postData[i].create.by);
				    	}
				    }

				    db.collection("users", function(colerr2, collection2) {
				    	assert.equal(null, colerr2);
				    	
				    	collection2.find({'id': {'$in' : userIds}}, { fields: {id: 1, name: 1, portrait: 1, location: 1, _id: 0} }).toArray(function(err, userData) {
						    assert.equal(null, err);
						    
						    hashMap = {};
						    for(i = 0; i < userData.length; i++) {
						    	hashMap[userData[i].id] = { name: userData[i].name, portrait: userData[i].portrait, location: userData[i].location };
						    	
						    }
						    
						    for(i = 0; i < allData.length; i++) {
						    	if(allData[i].create.by.length > 0) {
						    		allData[i].name = hashMap[ allData[i].create.by ].name;
						    		allData[i].portrait = hashMap[ allData[i].create.by ].portrait;
						    		allData[i].location = hashMap[ allData[i].create.by ].location;
						    	} else {
						    		allData[i].name = "Anonymous";
						    		allData[i].portrait = "https://cdn2.iconfinder.com/data/icons/windows-8-metro-style/128/user.png";
						    		allData[i].location = "Unknown";
						    	}
						    }
						    
						    res.writeHead(200, {
						    	'Content-Type': 'text/plain',
						    	'Access-Control-Allow-Origin': '*',
						    	'Access-Control-Allow-Methods': 'GET, POST',
						    	'Access-Control-Allow-Headers': 'Content-Type'
						    });
					
						    res.end( '"' + encodeURIComponent( JSON.stringify(allData) ) + '"' );
					    });
					});
					
					/*
					 * 单独发一个没有用户信息的post json和一个用户信息的user json会不会省流量和减少服务器运算？
					 */
				});
				
			}

		} else if(paras.length == 5) {
			//get one or several
			var o_id = decodeURIComponent( paras[4] ).replace(/\s+/g, ' ').split(','); //[id, id, id]
			//console.log(o_id);
				
			collection.find({'id': {'$in' : o_id}}, { _id: 0 }).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 

		} else if(paras.length >= 6) {
			
			switch(paras[5]) {

				case "new"://	/v1/posts/post//new/data, id field is null
			    	collection.insert(JSON.parse( decodeURIComponent( paras[6] ) ), { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
						
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
	
					}); 
					
					break;
				
				
				case "update"://	/v1/posts/post/Post-Id/update/{'like_num': 1}
					//var o_id = new BSON.ObjectID( paras[4] );
					var o_id = paras[4];
					
			    	collection.update({ 'id': o_id }, { $set: JSON.parse( decodeURIComponent( paras[6] ) ) }, { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;
					
					
				case "delete"://	/v1/posts/post/Post-Id/delete
				//must be the author, who has the right to 
					//var o_id = new BSON.ObjectID( paras[4] );
					var o_id = paras[4];
					
			    	collection.remove({ 'id': o_id }, { w:1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
						/*
						 * 需要在user profile里把post项里的id也删除掉
						 */
						
					}); 
					
					break;	
			
			}

		} else {
			
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST',
				'Access-Control-Allow-Headers': 'Content-Type'
			});

			res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
		}
	});	
	
});



var dataOp_elements = ( function(paras, res) {
	
	db.collection("elements", function(colerr, collection) {
		
		//console.log(colerr);
		assert.equal(null, colerr);
		
		if(paras.length == 4) { //get all

			collection.find({}, { _id: 0 }).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 
		
		} else if(paras.length == 5) {
			//get one or several
			var o_id = decodeURIComponent( paras[4] ).replace(/\s+/g, ' ').split(','); //[id, id, id]
			//console.log(o_id);
				
			collection.find({'id': {'$in' : o_id}}, { _id: 0 }).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 

		} else if(paras.length >= 6) {
			
			switch(paras[5]) {

				case "new":
			    	collection.insert(JSON.parse( decodeURIComponent( paras[6] ) ), { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
						
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
	
					}); 
					
					break;
				
				
				case "update":
					var o_id = paras[4];
					
			    	collection.update({ 'id': o_id }, { $set: JSON.parse( decodeURIComponent( paras[6] ) ) }, { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;
					
					
				case "delete":
					var o_id = paras[4];
					
			    	collection.remove({ 'id': o_id }, { w:1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;	
			
			}

		} else {
			
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST',
				'Access-Control-Allow-Headers': 'Content-Type'
			});

			res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
		}
	});	
	
});




var dataOp_users = ( function(paras, res) {
	
	db.collection("users", function(colerr, collection) {
		
		//console.log(colerr);
		assert.equal(null, colerr);
		
		if(paras.length == 4) { //get all

			collection.find({}, { _id: 0}).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 
		
		} else if(paras.length == 5) {
			//get one or several
			var o_id = decodeURIComponent( paras[4] ).replace(/\s+/g, ' ').split(','); //[id, id, id]
			//console.log(o_id);
				
			collection.find({'id': {'$in' : o_id}}, { _id: 0 }).toArray(function(err, data) {
				assert.equal(null, err);
			    //console.log(data);
			    res.writeHead(200, {
			    	'Content-Type': 'text/plain',
			    	'Access-Control-Allow-Origin': '*',
			    	'Access-Control-Allow-Methods': 'GET, POST',
			    	'Access-Control-Allow-Headers': 'Content-Type'
			    });
		
			    res.end( '"' + encodeURIComponent( JSON.stringify(data) ) + '"' );
			}); 

		} else if(paras.length >= 6) {
			
			switch(paras[5]) {

				case "new":
			    	collection.insert(JSON.parse( decodeURIComponent( paras[6] ) ), { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
						
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
	
					}); 
					
					break;
				
				
				case "update":
					var o_id = paras[4];
					
			    	collection.update({ 'id': o_id }, { $set: JSON.parse( decodeURIComponent( paras[6] ) ) }, { w: 1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;
					
					
				case "delete":
					var o_id = paras[4];
					
			    	collection.remove({ 'id': o_id }, { w:1 }, function(err, result) {
						assert.equal(null, err);
			
						res.writeHead(200, {
							'Content-Type': 'text/plain',
						    'Access-Control-Allow-Origin': '*',
						    'Access-Control-Allow-Methods': 'POST',
						    'Access-Control-Allow-Headers': 'Content-Type'
						});
					
						if(err)	{
							res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
						} else {
							res.end( '"' + encodeURIComponent( '{"result": 1}' ) + '"' );
						}
						
					}); 
					
					break;	
			
			}

		} else {
			
			res.writeHead(200, {
				'Content-Type': 'text/plain',
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Methods': 'GET, POST',
				'Access-Control-Allow-Headers': 'Content-Type'
			});

			res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
		}
	});	
	
});




var dataOp_like = ( function(paras, res) {
	
	if(paras.length == 5) {
		
		var userId = decodeURIComponent( paras[3] );
		var postId = decodeURIComponent( paras[4] );
		
		db.collection("users", function(colerr, collection) {
			//console.log(colerr);
			assert.equal(null, colerr);
			
			//collection.update({ 'id': o_id }, { $inc: { like_num: 1} }, { w: 1 }, function(err, result) {
			collection.update({ 'id': userId }, { $addToSet: { like: postId } }, { w: 1 }, function(err, result) {
				assert.equal(null, err);			

				if(err)	{
					res.writeHead(200, {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'POST',
						'Access-Control-Allow-Headers': 'Content-Type'
					});
					res.end( '"' + encodeURIComponent( '{"like_num": -1}' ) + '"' );
				} else {
					db.collection("posts", function(colerr2, collection2) {
						assert.equal(null, colerr2);
						//console.log(colerr);
						collection2.findAndModify({ 'id': postId }, [['id', 1]], { $addToSet: { likes: userId } }, { new:true, upsert:false, w:1 }, function(err2, result2) {
							
							assert.equal(null, err2);
							
							res.writeHead(200, {
								'Content-Type': 'text/plain',
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'POST',
								'Access-Control-Allow-Headers': 'Content-Type'
							});

							if(err2)	{
								res.end( '"' + encodeURIComponent( '{"like_num": -1}' ) + '"' );
							} else {
								res.end( '"' + encodeURIComponent( '{"like_num": ' + result2.likes.length + '}' ) + '"' );
							}
						});
					});
				}		
			}); 
		});
		
	} else {
			
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST',
			'Access-Control-Allow-Headers': 'Content-Type'
		});

		res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
	}
	
});




var dataOp_unlike = ( function(paras, res) {
	
	
	if(paras.length == 5) {
		
		var userId = decodeURIComponent( paras[3] );
		var postId = decodeURIComponent( paras[4] );
		
		db.collection("users", function(colerr, collection) {
			//console.log(colerr);
			assert.equal(null, colerr);
			
			collection.update({ 'id': userId }, { $pull: { like: postId } }, { w: 1 }, function(err, result) {
				assert.equal(null, err);			

				if(err)	{
					res.writeHead(200, {
						'Content-Type': 'text/plain',
						'Access-Control-Allow-Origin': '*',
						'Access-Control-Allow-Methods': 'POST',
						'Access-Control-Allow-Headers': 'Content-Type'
					});
					res.end( '"' + encodeURIComponent( '{"like_num": -1}' ) + '"' );
				} else {
					db.collection("posts", function(colerr2, collection2) {
						assert.equal(null, colerr2);
						//console.log(colerr);
						collection2.findAndModify({ 'id': postId }, [['id', 1]], { $pull: { likes: userId } }, { new:true, upsert:false, w:1 }, function(err2, result2) {
							
							assert.equal(null, err2);
							
							res.writeHead(200, {
								'Content-Type': 'text/plain',
								'Access-Control-Allow-Origin': '*',
								'Access-Control-Allow-Methods': 'POST',
								'Access-Control-Allow-Headers': 'Content-Type'
							});

							if(err2)	{
								res.end( '"' + encodeURIComponent( '{"like_num": -1}' ) + '"' );
							} else {
								res.end( '"' + encodeURIComponent( '{"like_num": ' + result2.likes.length + '}' ) + '"' );
							}
						});
					});
				}		
			}); 
		});
		
	} else {
			
		res.writeHead(200, {
			'Content-Type': 'text/plain',
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST',
			'Access-Control-Allow-Headers': 'Content-Type'
		});

		res.end( '"' + encodeURIComponent( '{"result": 0}' ) + '"' );
			
	}
	
});




var dataOp = ( function(paras, res) {
/*
 			   0/ 1/  2   / 3 /    4    /    5   /  6
	GET POST	/v1/posts/basic							fields - posts: title, photo, create(by, on, last), like_num
														fields - users: name, portrait, location
    
	GET POST	/v1/posts/full							fields - posts: others
	GET			/v1/posts/post/Post-Ids					
				e.g. http://localhost:8124/v1/posts/post/p000001,p000002
				
	POST		/v1/posts/post/Post-Id/execute/{data}   execute: new, update, delete
	
	example:
	http://localhost:8124/v1/posts/post/fakeId/new/{"id": "p000100","title": "title","author": "author","photo": "photo","url": [],"likes": [],"serving": "","time": {},"description": "description","steps": {"text": {"whole": []},"video": {}},"elements": {"whol
	
	GET			/v1/elements/element/element-Ids        e.g. http://localhost:8124/v1/elements/element/e000001,e000002


	GET POST	/v1/users/user
	GET			/v1/users/user/User-Id
	POST		/v1/users/user/User-Id/execute/{data}
	
	POST		/v1/like/User-Id/Post-Id
	POST		/v1/unlike/User-Id/Post-Id
 */
		
	var op_type = paras[2];
	
	switch(op_type) {
		case "posts":
			dataOp_posts(paras, res);
			break;
		
		case "users":
			dataOp_users(paras, res);
			break;
			
		case "elements":
			dataOp_elements(paras, res);
			break;
		
		case "like":
			dataOp_like(paras, res);
			break;
			
		case "unlike":
			dataOp_unlike(paras, res);
			break;
		
		default:
			//missing error handling
			break;	
	}
	
});



http.createServer(function (req, res) {
    //console.log('request received');

    var url = require('url');
    //console.log(req.url);
	//var url_parts = url.parse(req.url, true);
	
	var paras = req.url.split("?_=");
	var paras = paras[0].split("/");


	dataOp(paras, res);

	//db.close();
	//mongoClient.close();

}).listen(8124);


	
	

