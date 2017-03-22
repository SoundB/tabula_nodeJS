// Setup basic express server
var express = require('express');
var app = express();
var server = require('http').createServer(app);
//var io = require('../..')(server);
//New:
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
	console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));

// Chatroom

var groups = new Array( {
	'roomId' : 1,
	'title' : '점심먹고 한판',
	'status' : 'wait',
	'owner' : 'タブラ',
	'guests' : []
}, {
	'roomId' : 2,
	'title' : '테스트 방 1',
	'status' : 'wait',
	'owner' : '방장1',
	'guests' : []
}, {
	'roomId' : 3,
	'title' : '테스트 방 2',
	'status' : 'wait',
	'owner' : '방장2',
	'guests' : []
}, {
	'roomId' : 4,
	'title' : '테스트 방 3',
	'status' : 'wait',
	'owner' : '방장3',
	'guests' : []
}, {
	'roomId' : 5,
	'title' : '테스트 방 4',
	'status' : 'wait',
	'owner' : '방장4',
	'guests' : []
} );

var usernames = {};
var userCnt = 0;
var numUsers = 0;

io.on('connection', function(socket) {
	
	var addedUser = false;
	
	socket.on('lounge refresh', function(username) {
		
		socket.join('lounge');

		socket.username = username;
		usernames[username] = username;
		++userCnt;
		addedUser = true; 

		var loungeInfo = {
			userCnt : userCnt,
			roomList : groups
		};

		socket.emit('lounge refresh', loungeInfo);

		socket.broadcast.to('lounge').emit('lounge refresh', loungeInfo);

	});

	socket.on('add room', function(data) {

		groups.push({
			'roomId' : 6,
			'title' : data,
			'status' : 'wait',
			'owner' : '방장4',
			'guests' : []
		});

		var loungeInfo = {
			userCnt : userCnt,
			roomList : groups
		};

		socket.emit('lounge refresh', loungeInfo);

		socket.broadcast.to('lounge').emit('lounge refresh', loungeInfo);

	});

	socket.on('lounge join room', function(data) {

		var roomName = 'room-' + data.roomId;

		// socket.leave('lounge');
		// socket.join(roomName);

		socket.emit('lounge join room', data);

		// socket.broadcast.to(roomName).emit('lounge join room', loungeInfo);

	});

	socket.on('lounge message', function(data) {

		socket.broadcast.to('lounge').emit('lounge message', {
			username : socket.username,
			message : data
		});
	});
	
	socket.on('waitroom refresh', function(data) {
		
		var roomName = 'room-' + data.roomId;
		
		socket.join(roomName);

		socket.emit('waitroom refresh', '::: self response - > ');

		socket.broadcast.to(roomName).emit('waitroom refresh', '::: broadcast.to(roomName) response -> ');

	});

	socket.on('disconnect', function() {
		
		if (addedUser) {
			delete usernames[socket.username];
			--userCnt;

			socket.broadcast.emit('user left', {
				username : socket.username,
				numUsers : numUsers
			});
		}
	});
});