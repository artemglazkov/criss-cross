'use strict';

const {EventBinder} = require('./tools');
const {Human, Bot, Game, BotStrategy} = require('./domain');

/**
 * Registry of games.
 */
class GameRegistry {
  /**
   * GameRegistry constructor.
   */
  constructor() {
    this.games = [];
  }

  /**
   * Adds the game to registry.
   * @param {Game} game - Game to add.
   */
  add(game) {
    this.games.push(game);
  }

  /**
   * Finds game available to join to.
   * @return {Game} - First available game or null when there is no one.
   */
  findAvailable() {
    return this.games.find(game => game.isPending);
  }

  /**
   * Finds registered game by given player.
   * @param {string} playerId - Player's UID from player.id.
   * @return {Game}           - Game contains given player or null when there is no one.
   */
  findByPlayer(playerId) {
    return this.games.find(game => game.players.find(player => player.id === playerId))
  }
}

/**
 * Controller of output events.
 * Emits events to connected socket and other connected socket.io-clients.
 * Each method represents an output event.
 */
class SocketOutputController {
  /**
   * SocketOutputController constructor.
   * @param {Socket} socket - Current connected socket.
   */
  constructor(socket) {
    this.socket = socket;
  }

  /**
   * Emits broadcast [join] event for all clients except own socket.
   * @fires SocketOutputController#join
   */
  join() {
    /**
     * @event SocketOutputController#join
     */
    this.socket.broadcast.emit('join');
  }

  /**
   * Emits [status] event with current game status.
   * @param {Game} game - Current game.
   * @fires SocketOutputController#status
   */
  status(game) {
    /**
     * Game status event.
     * @event SocketOutputController#status
     * @type {{values: number[], isOver: boolean, winner: Player}}
     * @property {number[][]} values                 - Game field.
     * @property {boolean} isOver                    - Whether game is over.
     * @property {{id: string, name: string}} winner - Player who won.
     */
    const status = game.json();
    this.socket.to(game.id).emit('status', status);
    this.socket.emit('status', status);
  }

  /**
   * Emits [putError] event with message explaining the cause of put error.
   * Sending params: `{message: string}`.
   * @param {Error} err - Error with message to send.
   * @fires SocketOutputController#putError
   */
  putError(err) {
    /**
     * Put error event.
     * @event SocketOutputController#putError
     * @type {Object}
     * @property {string} message - Error message.
     */
    this.socket.emit('putError', {message: err.message});
  }

  /**
   * Emits [message] event to game room and current socket.
   * Used to send server message to players of specific game.
   * @param {Game} game      - Target game for message.
   * @param {string} message - Message to send.
   * @fires SocketOutputController#message
   */
  message(game, message) {
    /**
     * Message event.
     * @event SocketOutputController#message
     * @type {string}
     */
    this.socket.to(game.id).emit('message', message);
    this.socket.emit('message', message);
  }
}

/**
 * Controller of input events.
 * Listens to events of connected socket.
 * Each method represents an input event.
 */
class SocketInputController {
  /**
   * SocketInputController constructor.
   * @param {Socket} socket              - Connected socket.
   * @param {SocketOutputController} out - Output controller to emit events.
   * @param {GameRegistry} gameRegistry  - Game registry to store and find games.
   */
  constructor(socket, out, gameRegistry) {
    this.socket = socket;
    this.out = out;
    this.gameRegistry = gameRegistry;
    this.user = new Human();
    new EventBinder().bind(this, socket);
  }

  /**
   * Logs the [connect] event.
   * Called in [connection] event listener one step above in the call stack .
   */
  connect() {
    console.log(this.socket.id, `user ${this.user.name} connected`);
  }

  /**
   * Listens to [start] event.
   * Creates a new game and registers current user as a player.
   * Joins current socket to the game room.
   * Sends [join] event to another player to make them connected to the game.
   * @param {{[bot]: boolean}} config           - Game config. If `{bot: true}` game will start with a second bot player.
   * @param {function(Object, Object)} callback - Called with (player, game) JSONs when start
   * @listens SocketInputController#start
   */
  start({bot}, callback) {
    const game = new Game();
    if (bot)
      game.register(new Bot(BotStrategy.firstAvailable), 1);

    this.gameRegistry.add(game);
    this.socket.join(game.id);
    const player = game.register(this.user);
    console.log(this.socket.id, `player ${player.name} started a new game ${game.id}`);
    this.out.join();
    callback(player.json(), game.json());
  }

  /**
   * Listens to [join] event.
   * Registers current user as a player in the first available game..
   * Joins current socket to the game room.
   * @param {function(Object, Object)} callback - Called with (player, game) JSONs when start
   * @listens SocketInputController#join
   */
  join(callback) {
    const game = this.gameRegistry.findAvailable();
    if (!game)
      return;

    this.socket.join(game.id);
    const player = game.register(this.user);
    console.log(this.socket.id, `player ${player.name} has joined to the game ${game.id}`);
    callback(player.json(), game.json());
  }

  /**
   * Listens to [disconnect] event.
   * Logs socket disconnection.
   * @listens SocketInputController#disconnect
   */
  disconnect() {
    console.log(this.socket.id, `player ${this.socket.id} disconnected`);
  }

  /**
   * Listens to [put] event.
   * Finds player by playerId and puts their mark to given place [x,y].
   * @param {string} playerId - Player UID from Player.id,
   * @param {number} x        - Row index.
   * @param {number} y        - Column index.
   */
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
      this.out.putError(err);
    }
  }
}

module.exports = {SocketInputController, SocketOutputController, GameRegistry};