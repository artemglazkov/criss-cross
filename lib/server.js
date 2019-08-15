'use strict';

const {EventBinder} = require('./tools');
const {Human, Game} = require('./domain');

class SocketOutputController {
  socket;

  constructor(socket) {
    this.socket = socket;
  }

  join() {
    this.socket.broadcast.emit('join');
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

class GameRegistry {
  constructor() {
    this.games = [];
  }

  add(game) {
    this.games.push(game);
  }

  findAvailable() {
    return this.games.find(game => game.isPending);
  }

  findByPlayer(playerId) {
    return this.games.find(game => game.players.find(player => player.id === playerId))
  }
}

class SocketInputController {
  constructor(socket, out, gameRegistry) {
    this.socket = socket;
    this.out = out;
    this.gameRegistry = gameRegistry;
    this.user = new Human();
    new EventBinder().bind(this, socket);
  }

  connect() {
    console.log(this.socket.id, `user ${this.user.name} connected`);
  }

  start(callback) {
    const game = new Game();
    this.gameRegistry.add(game);
    this.socket.join(game.id);
    const player = game.register(this.user);
    console.log(this.socket.id, `player ${player.name} started a new game ${game.id}`);
    this.out.join();
    callback(player.json(), game.json());
  }

  join(callback) {
    const game = this.gameRegistry.findAvailable();
    if (!game)
      return;

    this.socket.join(game.id);
    const player = game.register(this.user);
    console.log(this.socket.id, `player ${player.name} has joined to the game ${game.id}`);
    callback(player.json(), game.json());
  }

  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  put({playerId, x, y}) {
    const game = this.gameRegistry.findByPlayer(playerId);
    if (!game)
      return;

    const player = game.players.find(player => player.id === playerId);
    if (!player)
      return;

    console.log(this.socket.id, `player ${player.name} puts '${player.mark}' to [${x},${y}]`);
    try {
      game.put(x, y, player);
      this.out.status(game);
      if (game.isOver) {
        if (game.winner)
          this.out.message(game, `Player ${game.winner.name} wins`);
        this.out.message(game, 'GAME OVER');
      }
    } catch (err) {
      this.out.statusError(err);
    }
  }
}

module.exports = {SocketInputController, SocketOutputController, GameRegistry};