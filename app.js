'use strict';

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {Game, RealPlayer, BotPlayer, SimpleBotStrategy} = require('./criss-cross');

io.on('connection', function (socket) {
  console.log('a user connected');
  const game = new Game(3);

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('put', function ({x, y, mark}) {
    console.log(`user ${socket.id} puts '${mark}' to [${x},${y}]`);
    game.put(x, y, mark);
    socket.emit('status', game.values);
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
