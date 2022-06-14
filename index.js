const express = require("express"); 
const http = require("http");
const { dirname } = require("path");
const socketio = require("socket.io");
const { stripVTControlCharacters } = require("util");
const formateMessage = require('./utils/messages');
const {userJoin, getCurrentUser, getLeaveUser, getRoomUsers} = require("./utils/users");
const moment = require("moment");
const rightTime = moment();

const app = express();
const server = http.createServer(app);
const io =  socketio(server);

// Set static folder
app.use(express.static(__dirname + "/public"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/home.html");
});


const botName = 'ChatBot';

// run when client connects
io.on('connection', (socket) => {
    console.log("New user connected");

    socket.on('joinRoom', ({username, room}) => {
    
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // A greeting msg to current user
    socket.emit('message', formateMessage(botName,  'Welcome to ChatBot'));

    // a broadcast msg to all room users except current user/self
    socket.broadcast.to(user.room).emit('message', formateMessage(botName, `${user.username} has joined the chat`));   // all clients except self  

    // Send users and room info
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });
    });

    

    // user msg listening and send to room user
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formateMessage(user.username, msg ));
    });

    // user image listening and send to room user
    socket.on('userImage', function (data) {
        const user = getCurrentUser(socket.id);
        // io.to(user.room).emit('addimage', user.username, data);
        const time =rightTime.format('h:mm a');
        io.to(user.room).emit('addImage', user.username, data, time);
    });

      // when client disconnected
      socket.on('disconnect', () => {
        console.log('User is disconnected');

        const user = getLeaveUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', formateMessage(botName,  `${user.username} has left the chat`));
        
        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
        }

        
    });

});

const PORT = 6060;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));