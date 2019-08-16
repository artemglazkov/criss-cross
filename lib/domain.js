'use strict';

const uuid = require('uuid');
const {ConsoleGameRenderer} = require('./tools');

/**
 * Player profile.
 */
class Profile {
  /**
   * Profile basic constructor.
   * @param {string} name - Player's name.
   */
  constructor(name) {
    this.name = name;
  }
}

/**
 * Human player profile.
 * @extends Profile
 */
class Human extends Profile {
  /**
   * Human profile constructor.
   * @param {string} [name=Anonymous-UID] - Player's name.
   */
  constructor(name) {
    super(name || `Anonymous-${uuid.v4()}`);
  }
}

/**
 * Bot player profile.
 * @extends Profile
 */
class Bot extends Profile {
  /**
   * Bot profile constructor.
   * @param {function(Game, string): number[]} strategy - Function like that returns next bot's move [x,y].
   */
  constructor(strategy) {
    super(`Bot-${uuid.v4()}`);
    this.play = strategy;
  }
}

/**
 * Criss Cross game player.
 */
class Player {
  id;
  mark;
  profile;

  /**
   * Player constructor.
   * @param {string} mark - Mark the player plays with, usually 'x' or 'o'.
   */
  constructor(mark) {
    this.id = uuid.v4();
    this.mark = mark;
  }

  /**
   * Determines whether the player has registered profile.
   * @return {boolean} - True when player is registered.
   */
  get isRegistered() {
    return Boolean(this.profile);
  }

  /**
   * Determines whether the player registered as a Bot.
   * @return {boolean} - True when player is instance of Bot.
   */
  get isBot() {
    return this.profile instanceof Bot;
  }

  /**
   * Registers given `profile` as a player.
   * @param {Profile} profile - Player's profile to register.
   */
  register(profile) {
    this.profile = profile;
  }

  /**
   * Player's name based on profile when it is registered.
   * @return {string} - Player's name or 'unregistered' when player has not registered yet.
   */
  get name() {
    return this.isRegistered ? this.profile.name : 'unregistered';
  }

  /**
   * Plays the game when player is a Bot.
   * @param {Game} game - The game bot should puts the mark into.
   */
  play(game) {
    if (this.isBot) {
      const [x, y] = this.profile.play(game, this.mark);
      game.put(x, y, this);
    }
  }

  /**
   * Returns JSON representation of the player.
   * @return {{id: string, name: string, mark: string}} - Player as JSON.
   */
  json() {
    return {
      id: this.id,
      name: this.name,
      mark: this.mark
    };
  }
}

/**
 * Criss Cross game.
 */
class Game {
  /**
   * Game constructor.
   * @param {number} [size=3] - Game size.
   */
  constructor(size = 3) {
    this.id = uuid.v4();
    this.players = [new Player('x'), new Player('o')];
    this.turns = 0;
    this.winner = null;
    this.size = size;
    this.values = [];
    for (let i = 0; i < size; i++) {
      this.values.push([]);
      for (let j = 0; j < size; j++)
        this.values[i][j] = null;
    }
  }

  /**
   * Registers player in the game.
   * @param {Profile} profile  - Player profile to register.
   * @param {number}  [index]  - Player position to register, 0 or 1.
   * @return {Player}          - Registered player.
   */
  register(profile, index) {
    const player = index
      ? this.players[index]
      : this.players.find(player => !player.isRegistered);

    if (player)
      player.register(profile);

    this.continue();

    return player;
  }

  /**
   * Gets current player who should make the next move.
   * @return {Player} - Current player or null if game has not been started.
   */
  get currentPlayer() {
    return this.players.length > 0 ? this.players[this.turns % this.players.length] : null;
  }

  /**
   * Determines whether the game is over.
   * Players cannot make moves anymore.
   * @return {boolean} - True when there is a winner or number of turns is greater then possible.
   */
  get isOver() {
    return Boolean(this.winner) || this.turns > Math.pow(this.size, 2) - 1;
  }

  /**
   * Determines whether the game is still waiting for players.
   * @return {boolean} - True if at least one player is unregistered.
   */
  get isPending() {
    return Boolean(this.players.find(player => !player.isRegistered));
  }

  /**
   * Represents game in ASCII graphic.
   * @example
   *  x |   | o
   *  o | x | x
   *  x |   | o
   */
  toString() {
    return new ConsoleGameRenderer().render(this);
  }

  /**
   * Returns JSON representation of the game.
   * @return {{values: number[], isOver: boolean, winner: Player}} - Game as a JSON.
   */
  json() {
    return {
      values: this.values,
      isOver: this.isOver,
      winner: this.winner ? this.winner.json() : undefined
    }
  }

  /**
   * Checks whether player wins when put their mark at [x,y] place.
   * @param {number} x - Row index.
   * @param {number} y - Column index.
   * @return {boolean} - True if position at [x,y] wins.
   */
  checkWinAt(x, y) {
    const mark = this.values[x][y];

    const winRow = this.values[x].reduce((r, v) => (r && v === mark), true);
    const winCol = this.values.reduce((r, row) => (r && row[y] === mark), true);

    let [winDiag1, winDiag2] = [true, true];
    for (let i = 0; i < this.size; i++) {
      winDiag1 &= this.values[i][i] === mark;
      winDiag2 &= this.values[i][this.size - 1 - i] === mark;
    }

    return winRow || winCol || winDiag1 || winDiag2;
  }

  /**
   * Puts player's mark to [x,y] place.
   * @param {number} x      - Row index.
   * @param {number} y      - Column index.
   * @param {Player} player - Player who puts the mark.
   * @throws {Error} When game is over.
   * @throws {Error} When wrong player order is trying to move.
   * @throws {Error} When [x,y] cell is out of range.
   * @throws {Error} When [x,y] cell is already busy.
   */
  put(x, y, player) {
    if (this.isOver)
      throw new Error('Game is over');

    if (player.id !== this.currentPlayer.id)
      throw new Error('Wrong player order');

    const isValid = (x) => x >= 0 && x < this.size;
    if (!isValid(x) || !isValid(y))
      throw new Error(`Cell [${x},${y}] is out of range`);

    if (this.values[x][y])
      throw new Error(`Cell [${x},${y}] is already busy`);

    this.values[x][y] = player.mark;
    this.turns++;
    this.winner = this.checkWinAt(x, y) ? player : null;

    this.continue();
  }

  /**
   * Plays the game automatically when current player is a Bot.
   */
  continue() {
    if (!this.isOver && this.currentPlayer.isBot)
      this.currentPlayer.play(this);
  }
}

/**
 * Set of Bot strategies.
 */
class BotStrategy {
  /**
   * The simplest game strategy.
   * Finds first free place to put.
   * @param {Game}   game       - Game to play.
   * @param {string} mark       - Mark 'x' or 'y' to play with.
   * @return {number[]} - Coordinates [x, y] as an Array.
   */
  static firstAvailable(game, mark) {
    const values = game.values;
    for (let i = 0; i < values.length; i++)
      for (let j = 0; j < values[i].length; j++)
        if (!values[i][j])
          return [i, j];
  }
}

module.exports = {Human, Bot, Game, Player, BotStrategy};
