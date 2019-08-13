'use strict';

const {EventBinder} = require('./tools');
const {Player} = require('./domain');

class SocketInputController {
  constructor(socket, game) {
    this.socket = socket;
    this.game = game;
    socket.join(game.id);
    new EventBinder().bind(this, socket);
  }

  connect() {
    const player = new Player(this.socket.id, 'x');
    console.log(this.socket.id, `player ${player.name} has joined to the game ${this.game.id}`);
    this.game.register(player);
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({x, y}) {
    const player = this.game.currentPlayer;
    console.log(this.socket.id, `player ${player.name} put '${player.mark}' to [${x},${y}]`);
    try {
      this.game.put(x, y, player);
      // console.log(this.game.toString());
      this.socket.broadcast.to(this.game.id).emit('status', this.game);
      this.socket.emit('status', this.game);
    } catch (err) {
      console.error(this.socket.id, err.message);
      this.socket.emit('statusError', {message: err.message});
    }
  }
}

module.exports = {SocketInputController};