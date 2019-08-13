'use strict';

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const {Game, RealPlayer, BotPlayer, SimpleBotStrategy} = require('./criss-cross');
const {ConsoleGameRenderer} = require('./console');

let game;

class EventBinder {
  bind(source, target) {
    Object.getOwnPropertyNames(source.__proto__)
      .filter(m => m !== 'constructor' && !m.startsWith('_'))
      .forEach(method => {
        target.on(method, (...args) => source[method].apply(source, args));
      });
  }
}

class SocketInputController {
  constructor(socket) {
    this.socket = socket;
    new EventBinder().bind(this, socket);
  }

  connect() {
    console.log(this.socket.id, `player ${this.socket.id} connected`);
    if (!game)
      game = new Game(3);
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({x, y, mark}) {
    console.log(this.socket.id, `player ${this.socket.id} put '${mark}' to [${x},${y}]`);
    game.put(x, y, mark);
    console.log(new ConsoleGameRenderer().render(game));
    this.socket.emit('status', game);
  }
}

io.on('connection', function (socket) {
  new SocketInputController(socket).connect();
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});
