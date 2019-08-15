'use strict';

const uuid = require('uuid');
const {ConsoleGameRenderer} = require('./tools');

class Profile {
  constructor(name) {
    this.name = name;
  }
}

class Human extends Profile {
  constructor(name) {
    super(name || `Anonymous-${uuid.v4()}`);
  }
}

class Bot extends Profile {
  constructor(strategy) {
    super(`Bot-${uuid.v4()}`);
    this.play = strategy;
  }
}

class Player {
  mark;
  profile;

  constructor(mark) {
    this.id = uuid.v4();
    this.mark = mark;
  }

  get isRegistered() {
    return Boolean(this.profile);
  }

  get isBot() {
    return this.profile instanceof Bot;
  }

  register(user) {
    this.profile = user;
  }

  get name() {
    return this.isRegistered ? this.profile.name : 'unregistered';
  }

  play(game) {
    if (this.isBot) {
      const [x, y] = this.profile.play(game, this.mark);
      game.put(x, y, this);
    }
  }

  json() {
    return {
      id: this.id,
      name: this.name,
      mark: this.mark
    };
  }
}

class Game {
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

  get currentPlayer() {
    return this.players.length > 0 ? this.players[this.turns % this.players.length] : null;
  }

  register(user, index) {
    const player = index
      ? this.players[index]
      : this.players.find(player => !player.isRegistered);

    if (player)
      player.register(user);

    this.continue();

    return player;
  }

  get isOver() {
    return Boolean(this.winner) || this.turns > Math.pow(this.size, 2) - 1;
  }

  get isPending() {
    return Boolean(this.players.find(player => !player.isRegistered));
  }

  toString() {
    return new ConsoleGameRenderer().render(this);
  }

  json() {
    return {
      values: this.values,
      isOver: this.isOver,
      winner: this.winner ? this.winner.json() : undefined
    }
  }

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

  continue() {
    if (!this.isOver && this.currentPlayer.isBot)
      this.currentPlayer.play(this);
  }
}

class SimpleBotStrategy {
  static findNext(game) {
    const values = game.values;
    for (let i = 0; i < values.length; i++)
      for (let j = 0; j < values[i].length; j++)
        if (!values[i][j])
          return [i, j];
  }
}

module.exports = {Human, Bot, Game, Player, SimpleBotStrategy};
