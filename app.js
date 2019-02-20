const express = require('express');
const app = express();
const path = require('path');

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

let  SOCKET_LIST = {};

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

    socket.emit('userData', total);

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message: data.message, username: name})
    })

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', {username:name, typing:data});
    })
});