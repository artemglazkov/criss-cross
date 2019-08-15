'use strict';

const {EventBinder} = require('./tools');
const {Human} = require('./domain');

class SocketOutputController {
  socket;

  constructor(socket) {
    this.socket = socket;
  }

  status(game) {
    const status = game.json();
    this.socket.to(game.id).emit('status', status);
    this.socket.emit('status', status);
  }

  statusError(err) {
    this.socket.emit('statusError', {message: err.message});
  }

  message(game, message) {
    this.socket.to(game.id).emit('message', message);
    this.socket.emit('message', message);
  }
}

class SocketInputController {
  constructor(socket, out, game) {
    this.socket = socket;
    this.out = out;
    this.user = new Human();
    this.game = game;
    this.player = null;
    socket.join(game.id);
    new EventBinder().bind(this, socket);
  }

  connect() {
    console.log(this.socket.id, `user ${this.user.name} connected`);
  }

  join(callback) {
    if (this.game.players.filter(player => !player.isRegistered).length === 0)
      return;

    this.player = this.game.register(this.user);
    console.log(this.socket.id, `player ${this.player.name} has joined to the game ${this.game.id}`);
    callback(this.player.mark, this.game.json());
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({x, y}) {
    if (!this.player)
      return;

    console.log(this.socket.id, `player ${this.player.name} puts '${this.player.mark}' to [${x},${y}]`);
    try {
      this.game.put(x, y, this.player);
      this.out.status(this.game);
      if (this.game.isOver) {
        if (this.game.winner)
          this.out.message(this.game, `Player ${this.game.winner.name} wins`);
        this.out.message(this.game, 'GAME OVER');
      }
    } catch (err) {
      this.out.statusError(err);
    }
  }
}

module.exports = {SocketInputController, SocketOutputController};