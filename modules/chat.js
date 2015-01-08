var config           = require('../config/config'),
    io = require('socket.io'),
    ioServer = io.listen(config[global.mode].msgPort),
    mongoose = require('mongoose'),
    passportSocketIo = require("passport.socketio"),
    cookieParser    = require('cookie-parser'),
    sequence = 1,
    users = [];

// Event fired every time a new client connects:
ioServer.on('connection', function(socket) {
    console.info('New client connected (id=' + socket.id + ').');

    socket.on("login", function(user){
       users[user.email] = socket;
    });

    //Add the new connection to the list of connected users

    socket.on("private", function(data) {
        io.sockets.sockets[data.to].emit("private", { from: client.id, to: data.to, msg: data.msg });
        socket.emit("private", { from: client.id, to: data.to, msg: data.msg });
    });


    // join to room and save the room name
    socket.on('join room', function (room) {
        socket.set('room', room, function() { console.log('room ' + room + ' saved'); } );
        socket.join(room);
    });

    socket.on('message', function(data) {
        console.log("Client data: " + data);

        // lookup room and broadcast to that room
        socket.get('room', function(err, room) {
            io.sockets.in(room).emit('message', data);
        })
    });


    // When socket disconnects, remove it from the list:
    socket.on('disconnect', function() {
        //take user offline
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.info('Client gone (id=' + socket.id + ').');
        }
    });
});

//ioServer.set( 'authorization', passportSocketIo.authorize({
//    cookieParser: cookieParser,
//    key:         'sid',       // the name of the cookie where express/connect stores its session_id
//    secret:      config.sessionId,    // the session_secret to parse the cookie
//    store:       global.mongooseSession,        // we NEED to use a sessionstore. no memorystore please
//    success:     onAuthorizeSuccess,  // *optional* callback on success - read more below
//    fail:        onAuthorizeFail     // *optional* callback on fail/error - read more below
//}));

function onAuthorizeSuccess(data, accept){
    console.log('successful connection to socket.io');
    // If you use socket.io@1.X the callback looks different
    accept();
}

function onAuthorizeFail(data, message, error, accept){
    if(error)
        throw new Error(message);
    console.log('failed connection to socket.io:', message);
    // If you use socket.io@1.X the callback looks different
    // If you don't want to accept the connection
    if(error)
        accept(new Error(message));
    // this error will be sent to the user as a special error-package
    // see: http://socket.io/docs/client-api/#socket > error-object
}
// Every 1 second, sends a message to a random client:
//setInterval(function() {
//    var randomClient;
//    if (clients.length > 0) {
//        randomClient = Math.floor(Math.random() * clients.length);
//        clients[randomClient].emit('foo', sequence++);
//    }
//}, 1000);