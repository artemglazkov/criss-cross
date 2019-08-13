'use strict';

const {EventBinder, ConsoleGameRenderer} = require('./tools');

class SocketInputController {
  constructor(socket, game) {
    this.socket = socket;
    this.game = game;
    socket.join(game.id);
    new EventBinder().bind(this, socket);
  }

  connect() {
    console.log(this.socket.id, `player ${this.socket.id} connected to game ${this.game.id}`);
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({x, y, mark}) {
    console.log(this.socket.id, `player ${this.socket.id} put '${mark}' to [${x},${y}]`);
    this.game.put(x, y, mark);
    console.log(new ConsoleGameRenderer().render(this.game));
    this.socket.broadcast.to(this.game.id).emit('status', this.game);
    this.socket.emit('status', this.game);
  }
}

module.exports = {SocketInputController};