const express = require('express');
const app = express();
const path = require('path');
let usernames = [];
let rooms = ['Lobby'];

//Route
app.get('/', function(req, res){
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(path.join(__dirname + 'client')));
app.use(express.static(path.resolve('./public')));

let server = app.listen(3000, '0.0.0.0', function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Server run on http://%s:%s/', host, port);
});

let io = require('socket.io')(server, {});

//listen on every connection
io.on('connection', function(socket){
    let name = socket.username;
    let id = socket.id;

    name = Math.random();
    id = Math.random();
    var pack = {
        id: id,
        name:name
    };
    var total=io.engine.clientsCount;
    
    socket.on('new user', function (data, callback) {
        socket.room = 'Lobby';
        socket.join('Lobby');
        socket.emit('updatechat', 'SERVER', 'you have connected to Lobby');
        socket.broadcast.to('Lobby').emit('updatechat', 'SERVER', data + ' has connected to this room');
        socket.emit('updaterooms', rooms, 'Lobby');

        if(usernames.indexOf(data) != -1){
            callback(false);
        }else{
            callback(true);
            socket.username = data;

            usernames.push(socket.username);
            updateUsernames();
        }
    });

    socket.on('create', function(room) {
        rooms.push(room);
        socket.emit('updaterooms', rooms, socket.room);
    });

    socket.on('switchRoom', function(newroom) {
        var oldroom;
        oldroom = socket.room;
        socket.leave(socket.room);
        socket.join(newroom);
        socket.emit('updatechat', 'SERVER', 'you have connected to ' + newroom);
        socket.broadcast.to(oldroom).emit('updatechat', 'SERVER', socket.username + ' has left this room');
        socket.room = newroom;
        socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username + ' has joined this room');
        socket.emit('updaterooms', rooms, newroom);
    });

    function updateUsernames(){
        io.sockets.emit('usernames', usernames);
    }

    socket.on('new_message', (data) => {
        //io.sockets.emit('new_message', {message: data.message, username: socket.username});
        io.sockets["in"](socket.room).emit('new_message', {message: data.message, username: socket.username});
    });

    socket.on('typing', (data) => {
        //socket.broadcast.emit('typing', {username:socket.username, typing:data});
        socket.broadcast.to(socket.room).emit('typing', {username:socket.username, typing:data});
    });

    //Disconnect
    socket.on('disconnect', function(data){
        if(!socket.username){
            return;
        }

        usernames.splice(usernames.indexOf(socket.username), 1);
        updateUsernames();
        socket.leave(socket.room);
    })
});