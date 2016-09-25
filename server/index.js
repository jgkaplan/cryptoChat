var express = require('express');
var io = require('socket.io');
var kbpgp = require('kbpgp');
var bodyParser = require('body-parser');
var aesjs = require('aes-js');

var app = express();
var port = process.env.PORT || 3000;

app.post('/roomList', function(req,res){
	res.send('coming soon...');
});

app.use(bodyParser.urlencoded({extended:true}));
io.listen(app.listen(port));
var room = io.of('/room');

//eventually make this a database
var roomList = {};
var keys = {};
room.on('connection', function(socket){
	var roomID;
	socket.on('joinRoom', function(roomid, key){
		socket.join(roomid);
		roomID = roomid;
		kbpgp.KeyManager.import_from_armored_pgp({armored: key},function(err,k){
			keys[socket.id] = key;
		});
		room.to(roomid).emit('playerJoined',socket.id);
		roomList[roomid] = genKey();
	});
	socket.on('getKey', function(){
		kbpgp.box({msg:roomList[roomID], encrypt_for:keys[socket.id]}, function(err, result_string, result_buffer){
			socket.emit('key', result_string);
		});
	});
	socket.on('disconnect', function(){
		room.to(roomID).emit('playerLeave',socket.id);
	});
});

function genKey() {
 	var key = '';
	while(key=='' || key.length != 32){
		key = (Math.random().toString(36)+Math.random().toString(36)).replace(/^0/g, '').replace(/[^a-zA-Z0-9]/g, '').substr(0, 32);
	}
	return key;
}

function genRoomID() {
	var id = '';
	while (id == '' || rooms.indexOf(id) != -1 || id.length != 5) {
		id = Math.random().toString(36).replace(/^0/g, '').replace(/[^a-zA-Z0-9]/g, '').substr(0, 5).toUpperCase();
	}
	rooms.push(id);
	return id;
}
