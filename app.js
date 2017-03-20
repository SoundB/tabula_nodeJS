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

		socket.username = username;
		usernames[username] = username;
		++userCnt;
		addedUser = true;

		var loungeInfo = {
			userCnt : userCnt,
			roomList : groups
		};

		socket.emit('lounge refresh', loungeInfo);

		socket.in('lounge').emit('lounge refresh', loungeInfo);

	});

	socket.on('join room', function(data) {

		var roomName = 'room-' + data.roomId;

//		socket.join(roomName);

		socket.in('lounge').emit('join room', data);

		socket.in(roomName).emit('room refresh', ':::: complete' + data.id);

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

		socket.in('lounge').emit('lounge refresh', loungeInfo);

	});

	// when the client emits 'new message', this listens and executes
	socket.on('new message', function(data) {
		// we tell the client to execute 'new message'
		socket.broadcast.emit('new message', {
			username : socket.username,
			message : data
		});
	});

	// when the client emits 'add user', this listens and executes
	socket.on('add user', function(username) {
		// we store the username in the socket session for this client
		socket.username = username;
		// add the client's username to the global list
		usernames[username] = username;
		++numUsers;
		addedUser = true;
		socket.emit('login', {
			numUsers : numUsers
		});
		// echo globally (all clients) that a person has connected
		socket.broadcast.emit('user joined', {
			username : socket.username,
			numUsers : numUsers
		});
	});

	// when the client emits 'typing', we broadcast it to others
	socket.on('typing', function() {
		socket.broadcast.emit('typing', {
			username : socket.username
		});
	});

	// when the client emits 'stop typing', we broadcast it to others
	socket.on('stop typing', function() {
		socket.broadcast.emit('stop typing', {
			username : socket.username
		});
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function() {
		// remove the username from global usernames list
		if (addedUser) {
			delete usernames[socket.username];
			--userCnt;

			// echo globally that this client has left
			socket.broadcast.emit('user left', {
				username : socket.username,
				numUsers : numUsers
			});
		}
	});
});
