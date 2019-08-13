'use strict';

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {Game, RealPlayer, BotPlayer, SimpleBotStrategy} = require('./lib/criss-cross');
const {SocketInputController} = require('./lib/server');

let game;

io.on('connection', function (socket) {
  if (!game)
    game = new Game(3);
  new SocketInputController(socket, game).connect();
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
