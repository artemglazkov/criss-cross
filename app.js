'use strict';

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const {SocketInputController, SocketOutputController, GameRegistry} = require('./lib/server');

const gameRegistry = new GameRegistry();

io.on('connection', function (socket) {
  new SocketInputController(socket, new SocketOutputController(socket), gameRegistry).connect();
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
