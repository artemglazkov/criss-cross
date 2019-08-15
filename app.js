'use strict';

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {Bot, Game, SimpleBotStrategy} = require('./lib/domain');
const {SocketInputController, SocketOutputController} = require('./lib/server');

let game;

io.on('connection', function (socket) {
  if (!game) {
    game = new Game(3);
    game.register(new Bot(SimpleBotStrategy.findNext), 1);
  }
  new SocketInputController(socket, new SocketOutputController(socket), game).connect();
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
