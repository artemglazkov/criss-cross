'use strict';

const {EventBinder} = require('./tools');
const {User} = require('./domain');

class SocketInputController {
  constructor(socket, game) {
    this.socket = socket;
    this.user = new User('Anonymous');
    this.game = game;
    this.player = null;
    socket.join(game.id);
    new EventBinder().bind(this, socket);
  }

  connect() {
    console.log(this.socket.id, `user ${this.user} connected`);
  }

  join(callback) {
    this.player = this.game.register(this.user);
    console.log(this.socket.id, `player ${this.player.name} has joined to the game ${this.game.id}`);
    callback(this.player.mark, this.game);
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({x, y}) {
    console.log(this.socket.id, `player ${this.player.name} puts '${this.player.mark}' to [${x},${y}]`);
    try {
      this.game.put(x, y, this.player);
      this.socket.broadcast.to(this.game.id).emit('status', this.game);
      this.socket.emit('status', this.game);
    } catch (err) {
      console.error(this.socket.id, err.message);
      this.socket.emit('statusError', {message: err.message});
    }
  }
}

module.exports = {SocketInputController};